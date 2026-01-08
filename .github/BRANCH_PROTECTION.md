# Branch Protection Setup Guide

This guide explains how to configure GitHub branch protection rules to prevent merging PRs until all CI checks pass.

## Steps to Configure Branch Protection

1. **Navigate to Repository Settings**
   - Go to your GitHub repository
   - Click on **Settings** (top menu)
   - Click on **Branches** (left sidebar)

2. **Add Branch Protection Rule**
   - Click **Add rule** button
   - In the **Branch name pattern** field, enter: `main`
   - (Optionally add another rule for `develop` branch)

3. **Configure Protection Settings**

   Enable the following settings:
   
   - ✅ **Require a pull request before merging**
     - Optionally: Require approvals (recommended: 1)
     - Optionally: Dismiss stale pull request approvals when new commits are pushed
   
   - ✅ **Require status checks to pass before merging**
     - Check: **Require branches to be up to date before merging**
     - In the search box, type and select:
       - `lint-and-format` (from CI workflow)
       - `build-and-deploy` (from deploy workflow)
   
   - ✅ **Require conversation resolution before merging** (optional but recommended)
   
   - ✅ **Do not allow bypassing the above settings** (optional but recommended for main branch)

4. **Save Changes**
   - Click **Create** or **Save changes** button

## What This Does

Once configured:
- ✅ Pull requests cannot be merged if linting fails
- ✅ Pull requests cannot be merged if formatting check fails
- ✅ Pull requests cannot be merged if build fails
- ✅ Pull requests must be up to date with the base branch
- ✅ All required status checks must pass (green checkmarks)

## Workflow Status Checks

The following status checks will appear on PRs:

1. **lint-and-format** - Runs ESLint and Prettier checks
2. **build-and-deploy** - Builds the project and deploys (on main branch)

Both checks must pass before a PR can be merged.

## Troubleshooting

### Status checks not appearing?

1. Make sure the workflows are in `.github/workflows/` directory
2. Ensure workflows are committed and pushed to the repository
3. Check that workflows trigger on `pull_request` events
4. Wait a few minutes for GitHub to register the workflows

### Can't see required status checks?

1. The workflows need to run at least once before they appear in the list
2. Create a test PR to trigger the workflows
3. After the workflows run, they will appear in the branch protection settings

### Checks are failing?

- Run `npm run check` locally to see what's failing
- Fix issues locally with `npm run check:fix`
- Commit and push the fixes

