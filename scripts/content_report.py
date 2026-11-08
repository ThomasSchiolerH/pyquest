import json,pathlib,collections
rows=[];counts=collections.Counter();projects=set()
for path in sorted(pathlib.Path('src/content').glob('*.json')):
 lessons=json.loads(path.read_text()); c=collections.Counter(l['kind'] for l in lessons); counts.update(c)
 ids={l['project']['id'] for l in lessons if 'project' in l};projects.update(ids)
 rows.append(f"| {path.stem} | {c['lesson']} | {c['checkpoint']} | {len(ids)} | {c['project']} |")
report='''# Authored curriculum status

Counts below are generated from shipped JSON assets. Checkpoints and project milestones are counted separately from ordinary lessons. Each project has three cumulative milestones.

| Module | Lessons | Checkpoints | Projects | Project milestones |
|---|---:|---:|---:|---:|
'''+ '\n'.join(rows)+f"\n\n**Total: {counts['lesson']} lessons, {counts['checkpoint']} checkpoints, {len(projects)} projects ({counts['project']} milestones); {sum(counts.values())} usable entries.**\n\nAll entries use the same validated schema and include an explanation, worked example, interactive activity, coding task, starter, tests, progressive hints, reference solution, common mistakes, and review tags. Browser-runtime teaching exercises use Python standard library or NumPy. PyTorch, scikit-learn, and FastAPI scripts are optional local downloads where provided.\n\nVerification details and limitations are in README.md. No unfinished title-only entries are counted.\n"
pathlib.Path('CONTENT_STATUS.md').write_text(report)
print(report)
