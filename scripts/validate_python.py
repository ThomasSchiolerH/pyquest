"""Execute every reference solution and ensure starter stubs do not earn credit."""
import ast, asyncio, inspect, json, pathlib, contextlib, io

def execute(source, namespace, filename="<exercise>"):
    compiled = compile(source, filename, "exec", flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)
    pending = eval(compiled, namespace)
    if inspect.isawaitable(pending):
        asyncio.run(pending)

count=tests=0
for path in sorted(pathlib.Path('src/content').glob('*.json')):
    entries=json.loads(path.read_text())
    for lesson in entries:
        ex=lesson['exercise']; ns={'__name__':'__main__'}
        try:
            with contextlib.redirect_stdout(io.StringIO()):
                execute(ex['solution'],ns,lesson['id'])
                for test in ex['tests']:
                    execute(test['code'],ns);tests+=1
            starter={}; failed=False
            try:
                with contextlib.redirect_stdout(io.StringIO()):
                    execute(ex['starter'],starter)
                    for test in ex['tests']:execute(test['code'],starter)
            except BaseException:failed=True
            assert failed, 'Starter already passes every test'
            assert len(lesson['explanation'].split())>=100, 'Explanation too short'
            count+=1
        except BaseException as error:
            raise RuntimeError(f"{lesson['id']}: {error}") from error
    print(f'{path.name}: {len(entries)} reference solutions validated')
print(f'PASS: {count} reference solutions; {tests} assertions/test cases; all starters fail at least one test')
