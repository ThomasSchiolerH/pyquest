import {openDB} from 'idb';
import type {Progress} from '../schema';
import {freshProgress} from './progress';
const db=()=>openDB('pyquest',1,{upgrade(db){db.createObjectStore('learning')}});
export async function loadProgress():Promise<Progress>{return (await(await db()).get('learning','progress'))||freshProgress()}
export async function saveProgress(progress:Progress){await(await db()).put('learning',progress,'progress')}
