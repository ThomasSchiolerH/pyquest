// Executes the shipped worker's Python harness using the same Pyodide version.
// Node supplies the worker message transport; this is not a browser layout test.
import {loadPyodide} from 'pyodide';
import {readFileSync,readdirSync} from 'node:fs';
const runtime=await loadPyodide();
await runtime.loadPackage('numpy');
globalThis.loadPyodide=async()=>runtime;
globalThis.importScripts=()=>{};
let result;
globalThis.self={postMessage(message){if(message.type==='result')result=message.result}};
await import('../public/python-worker.js');
let n=0;
for(const file of readdirSync('src/content').filter(f=>f.endsWith('.json'))){
 for(const lesson of JSON.parse(readFileSync('src/content/'+file,'utf8'))){
  result=null;
  await self.onmessage({data:{code:lesson.exercise.solution,tests:lesson.exercise.tests,packages:lesson.exercise.packages}});
  if(result.error||result.tests.some(t=>!t.passed))throw new Error(lesson.id+'\n'+JSON.stringify(result));
  n++;
 }
 console.log(file+' passed in real Pyodide');
}
await self.onmessage({data:{code:'raise ValueError("traceback check")',tests:[],packages:[]}});
if(!result.error.includes('ValueError: traceback check'))throw Error('Missing traceback');
console.log(`PASS: ${n} solutions executed in Pyodide 0.27.7, plus exception propagation`);
