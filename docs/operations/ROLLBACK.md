# Rollback Procedures

In case of a faulty deployment to production, use one of the following methods to restore service.

## Method 1: Re-run a Previous Successful Workflow

This is the fastest way to rollback if the previous build artifact is still available.

1.  Go to the **Actions** tab in the GitHub repository.
2.  Locate a previous run of the `Deploy and Preview` workflow that was successful and stable.
3.  Click on the run.
4.  Click **Re-run jobs** and select **Re-run all jobs** or specifically the `Deploy to Production` job.
5.  This will reuse the validated build artifact from that run and deploy it to production.

## Method 2: Git Revert

If Method 1 is not applicable or if you want a permanent fix in the history:

1.  Identify the commit that introduced the issue.
2.  On your local machine, run:
    ```bash
    git revert <commit-hash>
    git push origin main
    ```
3.  This will trigger a new workflow run. Once the `build-and-test` job completes, it will follow the standard deployment process (requiring approval if configured).

## Method 3: Re-deploying a Tag

If you use semantic tagging (e.g., `v1.0.0`), you can manually trigger a deployment of a known good tag by pushing it again or using a manual workflow dispatch if configured.
