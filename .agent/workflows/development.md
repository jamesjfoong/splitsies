---
description: Development workflow for creating features and PRs
---

# Development Workflow

## Starting a New Feature

1. Create a feature branch from main:

```bash
git checkout main
git pull origin main
git checkout -b f/<feature-name>
```

## Making Changes

// turbo-all 2. Make your code changes 3. Test locally:

```bash
bun run dev
```

4. Run quality checks:

```bash
bun run lint
bun run tsc --noEmit
```

## Creating a Pull Request

5. Stage and commit changes:

```bash
git add -A
git commit -m "<type>: <description>"
```

Commit types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactoring
- `ci`: CI/CD changes
- `chore`: Maintenance

6. Push branch and create PR:

```bash
git push -u origin f/<feature-name>
gh pr create --fill
```

7. If PR needs updates after review:

```bash
git add -A
git commit -m "fix: address review feedback"
git push
```

## Releasing a Version

8. After PR is merged, create a release tag:

```bash
git checkout main
git pull origin main
git tag -a v<version> -m "Release v<version>"
git push origin v<version>
```

Version format: `v1.0.0` (major.minor.patch)

- **major**: Breaking changes
- **minor**: New features (backwards compatible)
- **patch**: Bug fixes

The release workflow will automatically:

- Build the project
- Create a GitHub Release
- Trigger Vercel production deployment
