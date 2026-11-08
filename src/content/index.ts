import type {Lesson,Project,Section} from '../schema';
export {modules} from './modules';
const files=import.meta.glob('./*.json',{eager:true,import:'default'});
export const lessons=Object.values(files).flat() as Lesson[];
export const lessonMap=new Map(lessons.map(l=>[l.id,l]));
export const moduleLessons=(id:string)=>lessons.filter(l=>l.module===id);
export const projects:Project[]=Array.from(new Set(lessons.filter(l=>l.project).map(l=>l.project!.id))).map(id=>{const steps=lessons.filter(l=>l.project?.id===id).sort((a,b)=>a.project!.milestone-b.project!.milestone);return {id,title:steps[0].project!.title,moduleId:steps[0].module,milestoneIds:steps.map(l=>l.id)}});
export const sections:Section[]=Array.from(new Set(lessons.map(l=>`${l.module}::${l.section}`))).map(key=>{const [moduleId,title]=key.split('::');return {id:key,moduleId,title,lessonIds:lessons.filter(l=>l.module===moduleId&&l.section===title).map(l=>l.id)}});
