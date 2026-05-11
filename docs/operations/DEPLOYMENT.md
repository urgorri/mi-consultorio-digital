# Deployment Configuration

This project uses GitHub Actions for CI/CD. The primary workflow is defined in `.github/workflows/deploy-preview.yml`.

## Environment Protection

To ensure that deployments to production are reviewed and authorized, follow these steps in the GitHub repository settings:

1.  Navigate to **Settings** > **Environments**.
2.  Click **New environment** and name it `production`.
3.  Under **Deployment protection rules**:
    *   Enable **Required reviewers**.
    *   Add at least one reviewer who must approve deployments to this environment.
4.  (Optional) Configure **Deployment branch policy** to only allow deployments from the `main` branch.
5.  Save the changes.

With these settings, the `Deploy to Production` job in the workflow will wait for approval before proceeding.

## Preview Deployments

Every Pull Request targeting `main` will trigger a preview deployment. A comment will be automatically added to the PR with the link to the preview environment once the build and deployment are successful.
