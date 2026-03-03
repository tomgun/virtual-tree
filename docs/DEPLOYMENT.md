# Deployment Guide

## GitHub Pages Setup

### Prerequisites
1. Repository is on GitHub
2. GitHub Actions are enabled for the repository

### Steps

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Select "GitHub Actions"

2. **Verify Base Path**:
   - Check `vite.config.ts` - the `base` should match your repository name
   - If your repo is `virtual-tree`, base should be `/virtual-tree/`
   - If your repo is your username (e.g., `tomas/virtual-tree`), base should be `/virtual-tree/`

3. **Push to Main**:
   - The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically:
     - Build the project
     - Deploy to GitHub Pages
   - First deployment may take a few minutes

4. **Access Your Game**:
   - URL will be: `https://[your-username].github.io/virtual-tree/`
   - Or: `https://[your-org].github.io/virtual-tree/` if in an organization

### Manual Deployment

If you prefer manual deployment:

```bash
# Build the project
npm run build

# The dist/ folder contains the built files
# You can manually upload these to GitHub Pages
```

### Troubleshooting

- **404 Error**: Check that `base` in `vite.config.ts` matches your repository name
- **Build Fails**: Check GitHub Actions logs for errors
- **Assets Not Loading**: Ensure all asset paths are relative and base path is correct
