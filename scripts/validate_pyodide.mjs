// Executes the shipped worker's Python harness using the same Pyodide version.
// Node supplies the worker message transport; this is not a browser layout test.
import {loadPyodide} from 'pyodide';
import {readFileSync,readdirSync} from 'node:fs';
console.log(`Validating Pyodide under Node ${process.version}`);
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
  if(!result||result.error||result.tests.length!==lesson.exercise.tests.length||result.tests.some(t=>!t.passed))throw new Error(lesson.id+'\n'+JSON.stringify(result));
  n++;
 }
 console.log(file+' passed in real Pyodide');
}
await self.onmessage({data:{code:'raise ValueError("traceback check")',tests:[],packages:[]}});
if(!result.error.includes('ValueError: traceback check'))throw Error('Missing traceback');
console.log(`PASS: ${n} solutions executed in Pyodide 0.27.7, plus exception propagation`);
// Regression: async learner code and tests must work without run_sync/stack switching.
async function runAsyncCase(code, tests) {
  result = null;
  await self.onmessage({data:{code,tests,packages:[]}});
  if (!result) throw Error('Worker did not return a result');
  return result;
}
const asyncOutput = await runAsyncCase(
  'import asyncio\nasync def double(x):\n    await asyncio.sleep(0)\n    return x * 2\nprint(await double(21))\nanswer = await double(3)',
  [{name:'Awaited result',code:'assert await double(answer) == 12'},
   {name:'Async assertion traceback',code:'assert await double(2) == 5'}]
);
if (asyncOutput.error || asyncOutput.stdout !== '42\n' || asyncOutput.stderr ||
    asyncOutput.tests.length !== 2 || !asyncOutput.tests[0].passed ||
    asyncOutput.tests[1].passed || !asyncOutput.tests[1].error.includes('AssertionError')) {
  throw Error('Async output/test regression: ' + JSON.stringify(asyncOutput));
}
const asyncFailure = await runAsyncCase(
  'import asyncio\nasync def fail():\n    await asyncio.sleep(0)\n    raise ValueError("async failure")\nawait fail()', []
);
if (!asyncFailure.error?.includes('ValueError: async failure') || asyncFailure.stderr) {
  throw Error('Async traceback regression: ' + JSON.stringify(asyncFailure));
}
console.log('PASS: top-level await in learner code/tests, async stdout, assertion failures, and exception propagation');
