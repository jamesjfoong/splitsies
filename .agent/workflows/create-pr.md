---
description: Create a pull request for the current branch
---

# Create Pull Request

// turbo-all

1. Ensure you're on a feature branch (not main):

```bash
git branch --show-current
```

2. Push current branch to remote:

```bash
git push -u origin $(git branch --show-current)
```

3. Create the pull request:

```bash
gh pr create --fill --web
```

The `--fill` flag auto-fills title and body from commits.
The `--web` flag opens the PR in browser for final review.

## Alternative: Create PR with custom title

```bash
gh pr create --title "<type>: <description>" --body "## Summary\n\n<describe changes>\n\n## Testing\n\n- [ ] Tested locally\n- [ ] Lint passes\n- [ ] Build passes"
```
