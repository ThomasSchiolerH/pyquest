/* Real CPython via Pyodide. A fresh worker per run isolates lesson state.
   This is not a security boundary for untrusted third-party Python. */
self.onmessage=async({data})=>{
 const send=(message,phase='loading')=>self.postMessage({type:'status',message,phase});
 try {
  send('Loading Python… First run downloads the runtime.');
  importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');
  const pyodide=await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'});
  if(data.packages.length){send(`Loading ${data.packages.join(', ')}…`);await pyodide.loadPackage(data.packages);}
  pyodide.globals.set('_quest_code',data.code);
  pyodide.globals.set('_quest_tests',JSON.stringify(data.tests));
  send('Running your code and tests…','running');
  const json=await pyodide.runPythonAsync(`
import io, sys, json, traceback, contextlib
class LimitedOutput(io.StringIO):
    def write(self, value):
        remaining = max(0, 20000 - self.tell())
        return super().write(value[:remaining])
_out, _err = LimitedOutput(), LimitedOutput()
_results, _error = [], None
_namespace = {'__name__': '__main__'}
with contextlib.redirect_stdout(_out), contextlib.redirect_stderr(_err):
    try:
        exec(compile(_quest_code, 'your_code.py', 'exec'), _namespace)
    except BaseException:
        _error = traceback.format_exc()
    if _error is None:
        for _test in json.loads(_quest_tests):
            try:
                exec(compile(_test['code'], 'test_' + _test['name'], 'exec'), _namespace)
                _results.append({'name': _test['name'], 'passed': True})
            except BaseException:
                _results.append({'name': _test['name'], 'passed': False, 'error': traceback.format_exc()})
json.dumps({'stdout': _out.getvalue(), 'stderr': _err.getvalue(), 'error': _error, 'tests': _results})
`);
  self.postMessage({type:'result',result:JSON.parse(json)});
 }catch(e){self.postMessage({type:'result',result:{stdout:'',stderr:'',tests:[],error:String(e)}})}
};
