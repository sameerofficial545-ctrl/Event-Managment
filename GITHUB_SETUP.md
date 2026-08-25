# GitHub Setup Log — Event-Managment

This document records every command used to connect this local folder to GitHub
(`https://github.com/sameerofficial545-ctrl/Event-Managment`), in the order they were run.

## 1. Check existing git state

```bash
git remote -v
git status
git log --oneline -5
```
Found `origin` already pointed to the GitHub URL, but the repo didn't exist yet on GitHub.

## 2. Check for GitHub CLI (`gh`)

```bash
gh --version
gh auth status
```
Not installed — needed for authenticating and creating the repo without a manual token.

## 3. Confirm the remote repo doesn't exist yet

```bash
git ls-remote origin
```
Result: `Repository not found` — confirmed the repo had to be created on GitHub first.

## 4. Install GitHub CLI via winget (PowerShell)

```powershell
winget --version
winget install --id GitHub.cli -e --silent --accept-source-agreements --accept-package-agreements
```
The first attempt without `--silent` was cancelled by an interactive prompt; the silent flag fixed it.

## 5. Authenticate with GitHub (device code flow)

```powershell
$gh = "$env:ProgramFiles\GitHub CLI\gh.exe"
& $gh auth login --hostname github.com --git-protocol https --web
```
This printed a one-time code and a URL (`https://github.com/login/device`). Entering the code in
the browser and authorizing completed the login as `sameerofficial545-ctrl`.

## 6. Stage and fix the project structure

```bash
git add -A
```
This flagged `Front-end/` as an **embedded git repository** (it had its own `.git` folder, left
over from how the Vite app was created/extracted).

```bash
git restore --staged Front-end
```
Unstaged it to investigate first.

**Found**: the real app files were nested one level too deep, at `Front-end/Event-Managment/*`
instead of directly under `Front-end/`, and `Front-end/.git` was a separate repo pointing at a
placeholder remote.

**Fix — remove the nested repo and flatten the folder:**

```bash
rm -rf "Front-end/.git"
shopt -s dotglob
mv Front-end/Event-Managment/* Front-end/
rmdir Front-end/Event-Managment
```

## 7. Commit the front-end code

```bash
git add -A
git commit -m "Add Front-end Vite app"
```
(`node_modules` was excluded automatically via `Front-end/.gitignore`.)

## 8. Create the GitHub repository

```bash
gh repo create sameerofficial545-ctrl/Event-Managment --public --source=. --remote=origin-check
```
`gh repo create` creates the repo on GitHub. `--remote=origin-check` was used as a safe temporary
remote name so the existing `origin` wasn't overwritten unexpectedly.

```bash
git remote remove origin-check
```
Cleaned up the extra remote since `origin` already had the correct URL.

## 9. Push to GitHub

```bash
git branch -M main
git push -u origin main
```
Renamed the local branch from `master` to `main` (GitHub's default) and pushed, setting up
tracking between local `main` and `origin/main`.

## 10. Verify

```bash
git status
git log --oneline -5
git ls-remote origin
```
Confirmed the branch was up to date with `origin/main` and the commit history matched.

## 11. Add the empty Back-end folder

Git does not track empty directories, so `Back-end/` never appeared on GitHub. Fixed with a
placeholder file:

```bash
# created Back-end/.gitkeep (empty file)
git add Back-end/.gitkeep
git commit -m "Add Back-end folder placeholder"
git push
```
Once real backend files are added, `.gitkeep` can be deleted.

---

### End result
- Repo: https://github.com/sameerofficial545-ctrl/Event-Managment (public)
- Branch: `main`, tracking `origin/main`
- Contents: `Front-end/` (Vite app), `Back-end/` (placeholder), `.gitignore`
