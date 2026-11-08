import {z} from 'zod';
export const Difficulty=z.enum(['Foundation','Developing','Intermediate','Advanced','Applied']);
export const TestSchema=z.object({name:z.string().min(1),code:z.string().min(1),explanation:z.string().min(5)});
export const ActivitySchema=z.object({type:z.enum(['choice','true-false','predict','fill','order','match']),question:z.string().min(5),options:z.array(z.string()),answer:z.union([z.string(),z.array(z.string())]),explanation:z.string().min(10)});
export const ExerciseSchema=z.object({type:z.enum(['function','bug','independent','fill','project']),prompt:z.string().min(20),starter:z.string().min(1),solution:z.string().min(1),solutionExplanation:z.string().min(20),tests:z.array(TestSchema).min(3),hints:z.array(z.string()).min(2),packages:z.array(z.enum(['numpy']))});
export const LessonSchema=z.object({id:z.string().regex(/^[a-z][a-z0-9-]+$/),module:z.string(),section:z.string(),title:z.string(),minutes:z.number().int().min(5).max(30),difficulty:Difficulty,kind:z.enum(['lesson','checkpoint','project']),prerequisites:z.array(z.string()),objectives:z.array(z.string()).min(2),explanation:z.string().min(400),why:z.string().min(80),example:z.object({code:z.string(),explanation:z.string().min(100)}),activity:ActivitySchema,exercise:ExerciseSchema,mistakes:z.array(z.string()).min(2),xp:z.number().int().positive(),tags:z.array(z.string()).min(1),visual:z.enum(['vectors','gradient','pipeline','attention']).optional(),localCode:z.string().optional(),project:z.object({id:z.string(),title:z.string(),milestone:z.number().int().positive(),total:z.number().int().positive()}).optional()});
export type Lesson=z.infer<typeof LessonSchema>;
export type Activity=z.infer<typeof ActivitySchema>;
export type Exercise=z.infer<typeof ExerciseSchema>;
export type PythonTest=z.infer<typeof TestSchema>;
export interface Module {id:string;number:number;title:string;subtitle:string;description:string;color:string;icon:string;skills:string[];prerequisites:string[]}
export interface Section {id:string;moduleId:string;title:string;lessonIds:string[]}
export interface Checkpoint {id:string;lessonIds:string[];passScore:number}
export interface Project {id:string;title:string;moduleId:string;milestoneIds:string[]}
export interface ContentBlock {type:'explanation'|'example'|'activity'|'code'|'reflection';title:string}
export interface Achievement {id:string;title:string;description:string;icon:string;earned:boolean}
export interface LessonRecord {attempts:number;correct:number;incorrect:number;hints:number;activityPassed:boolean;codePassed?:string;completedAt?:string;reviewAt?:string;lastAttempt?:string;step?:number;solutionViewed?:boolean}
export interface Progress {version:1;records:Record<string,LessonRecord>;drafts:Record<string,string>;bookmarks:string[];skipped:string[];activity:Record<string,number>;settings:{name:string;goal:number;theme:'light'|'dark'|'system'};lastLesson?:string;checkpoints:Record<string,{score:number;passed:boolean;at:string}>}
