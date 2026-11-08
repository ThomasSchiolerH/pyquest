"""Execute every reference solution and ensure starter stubs do not earn credit."""
import json, pathlib, contextlib, io
count=tests=0
for path in sorted(pathlib.Path('src/content').glob('*.json')):
    entries=json.loads(path.read_text())
    for lesson in entries:
        ex=lesson['exercise']; ns={'__name__':'__main__'}
        try:
            with contextlib.redirect_stdout(io.StringIO()):
                exec(compile(ex['solution'],lesson['id'],'exec'),ns)
                for test in ex['tests']:
                    exec(test['code'],ns);tests+=1
            starter={}; failed=False
            try:
                with contextlib.redirect_stdout(io.StringIO()):
                    exec(ex['starter'],starter)
                    for test in ex['tests']:exec(test['code'],starter)
            except BaseException:failed=True
            assert failed, 'Starter already passes every test'
            assert len(lesson['explanation'].split())>=100, 'Explanation too short'
            count+=1
        except BaseException as error:
            raise RuntimeError(f"{lesson['id']}: {error}") from error
    print(f'{path.name}: {len(entries)} reference solutions validated')
print(f'PASS: {count} reference solutions; {tests} assertions/test cases; all starters fail at least one test')
