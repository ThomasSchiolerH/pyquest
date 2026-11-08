import {describe,it,expect,vi} from 'vitest';
import 'fake-indexeddb/auto';
import {readFileSync,readdirSync} from 'node:fs';
import {LessonSchema,type Lesson} from '../src/schema';
import {completeLesson,dayKey,freshProgress,freshRecord,scoreCheckpoint,streak,totalXP,unlocked,validateImport} from '../src/lib/progress';
import {loadProgress,saveProgress} from '../src/lib/storage';
import {PythonRuntime,type WorkerLike} from '../src/lib/runtime';
import {answerCorrect} from '../src/components/Activity';
const lessons:Lesson[]=readdirSync('src/content').filter(f=>f.endsWith('.json')).flatMap(f=>JSON.parse(readFileSync(`src/content/${f}`,'utf8')));
const l=lessons[0];
describe('Curriculum',()=>{
 it('all lessons meet the typed schema',()=>{for(const lesson of lessons){const parsed=LessonSchema.safeParse(lesson);expect(parsed.success,`${lesson.id}: ${parsed.success?'':parsed.error.message}`).toBe(true)}});
 it('has unique ids and real prerequisites',()=>{const ids=new Set(lessons.map(l=>l.id));expect(ids.size).toBe(lessons.length);for(const l of lessons)for(const id of l.prerequisites)expect(ids.has(id),`${l.id} -> ${id}`).toBe(true)});
 it('has valid activity answers and cumulative project milestones',()=>{for(const l of lessons){const a=l.activity;if(['choice','predict','true-false'].includes(a.type))expect(a.options).toContain(a.answer);if(a.type==='order')expect([...(a.answer as string[])].sort()).toEqual([...a.options].sort());if(a.type==='match')expect(a.answer.length).toBe(a.options.length)}const ids=new Set(lessons.filter(l=>l.project).map(l=>l.project!.id));for(const id of ids){const steps=lessons.filter(l=>l.project?.id===id);expect(steps.length).toBe(steps[0].project!.total);expect(steps.map(l=>l.project!.milestone).sort()).toEqual([1,2,3])}});
});
describe('Progress',()=>{
 it('persists drafts, bookmarks and settings',async()=>{const p=freshProgress();p.drafts[l.id]='print(42)';p.bookmarks=[l.id];await saveProgress(p);expect(await loadProgress()).toEqual(p)});
 it('gates completion and gives XP only once',()=>{let p=freshProgress();expect(()=>completeLesson(p,l)).toThrow();p.records[l.id]={...freshRecord(),activityPassed:true,codePassed:'pass'};p.drafts[l.id]='pass';p=completeLesson(p,l,new Date(2026,10,7));expect(totalXP(p)).toBe(l.xp);expect(totalXP(completeLesson(p,l))).toBe(l.xp);p.drafts[l.id]='changed';expect(()=>completeLesson(p,l)).toThrow()});
 it('calculates streaks across midnight and missed days',()=>{expect(streak({'2026-11-06':20,'2026-11-07':20},new Date(2026,10,8))).toBe(2);expect(streak({'2026-11-06':20},new Date(2026,10,8))).toBe(0);expect(dayKey(new Date(2026,0,1))).toBe('2026-01-01')});
 it('requires prerequisites or assessed skips',()=>{const p=freshProgress();const lesson={...l,prerequisites:['prior']};expect(unlocked(lesson,p)).toBe(false);p.skipped=['prior'];expect(unlocked(lesson,p)).toBe(true)});
 it('scores checkpoints, including empty attempts',()=>{expect(scoreCheckpoint([true,false,true,true])).toBe(75);expect(scoreCheckpoint([])).toBe(0)});
 it('validates backup imports',()=>{expect(validateImport(freshProgress(),lessons)).toEqual(freshProgress());expect(()=>validateImport({version:9},lessons)).toThrow()});
 it('checks answers by value and ordering',()=>{expect(answerCorrect(l.activity,l.activity.answer)).toBe(true);expect(answerCorrect({...l.activity,type:'order',answer:['a','b']},['b','a'])).toBe(false)});
});
describe('Worker lifecycle',()=>{
 it('terminates runaway execution and creates a new worker',async()=>{vi.useFakeTimers();const workers:WorkerLike[]=[];const factory=()=>{const w:WorkerLike={postMessage:vi.fn(),terminate:vi.fn(),onmessage:null,onerror:null};workers.push(w);return w};const runtime=new PythonRuntime(factory,100,1000);const run=runtime.run('while True: pass',[],[]);workers[0].onmessage!({data:{type:'status',phase:'running',message:'Running'}} as MessageEvent);await vi.advanceTimersByTimeAsync(101);expect((await run).error).toContain('timed out');expect(workers[0].terminate).toHaveBeenCalled();const second=runtime.run('print(1)',[],[]);workers[1].onmessage!({data:{type:'result',result:{stdout:'1',stderr:'',tests:[]}}}as MessageEvent);expect((await second).stdout).toBe('1');vi.useRealTimers()});
 it('cancels downloads cleanly',async()=>{const w:WorkerLike={postMessage:()=>{},terminate:vi.fn(),onmessage:null,onerror:null};const runtime=new PythonRuntime(()=>w);const run=runtime.run('',[],[]);runtime.cancel();expect((await run).error).toContain('stopped');expect(w.terminate).toHaveBeenCalled()});
});
describe('Curriculum dependency integrity',()=>{
 it('has no prerequisite cycles',()=>{const map=new Map(lessons.map(l=>[l.id,l]));const done=new Set<string>();function walk(id:string,stack:Set<string>){expect(stack.has(id),`cycle at ${id}`).toBe(false);if(done.has(id))return;const next=new Set(stack).add(id);for(const pre of map.get(id)!.prerequisites)walk(pre,next);done.add(id)}for(const lesson of lessons)walk(lesson.id,new Set())});
 it('locks normal checkpoints but permits explicit diagnostics',()=>{const p=freshProgress();const cp={...l,id:'checkpoint-test',kind:'checkpoint' as const,prerequisites:['required']};p.records[cp.id]={...freshRecord(),activityPassed:true,codePassed:'ok'};p.drafts[cp.id]='ok';expect(()=>completeLesson(p,cp)).toThrow(/prerequisites/);expect(completeLesson(p,cp,new Date(),true).records[cp.id].completedAt).toBeTruthy()});
});
