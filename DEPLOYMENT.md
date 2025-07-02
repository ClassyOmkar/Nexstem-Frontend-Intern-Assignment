# Deployment Instructions

## Quick Start Guide

### 1. Download and Setup
```bash
# Extract the project files
cd pipeline-editor-dag-builder

# Install dependencies
npm install

# Test locally
npm run dev
```

### 2. Deploy to Netlify

#### Method 1: GitHub + Netlify (Recommended)
1. Create a new GitHub repository
2. Upload all files from this folder to your GitHub repo
3. Go to [Netlify](https://netlify.com) and sign in
4. Click "New site from Git"
5. Connect your GitHub repository
6. Use these build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`
7. Click "Deploy site"

#### Method 2: Drag & Drop Deploy
1. Run `npm run build` locally
2. Go to [Netlify](https://netlify.com)
3. Drag the `dist` folder to the deploy area
4. Your site will be live instantly!

### 3. Update README
After deployment, update the live demo URL in README.md:
- Replace `https://your-app-name.netlify.app` with your actual Netlify URL
- Add screenshots to the README
- Update the Netlify badge with your site information

## Build Commands

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## Environment Requirements
- Node.js 18+
- npm 8+
- Modern web browser

## Troubleshooting

### Build Fails
- Ensure Node.js 18+ is installed
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Deployment Issues
- Check that `dist` folder exists after build
- Verify Netlify build settings match above
- Check build logs for specific errors

### Browser Issues
- Clear browser cache
- Ensure modern browser (Chrome 90+, Firefox 88+, Safari 14+)
- Check console for JavaScript errors

## Performance Notes
- Application loads in ~1-2 seconds
- Graph rendering handles 50+ nodes efficiently
- Mobile responsive design included