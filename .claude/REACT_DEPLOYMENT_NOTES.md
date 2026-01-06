# React Game Deployment Guide for GitHub Pages

This guide documents the process for deploying React/Vite games to GitHub Pages in subdirectories.

## The Problem

When deploying React apps with React Router to GitHub Pages subdirectories (e.g., `/gamename/`), two main issues occur:
1. **White screen** - Assets can't be found because Vite doesn't know the base path
2. **404 on navigation** - React Router doesn't know it's in a subdirectory

## The Solution (Step-by-Step)

### 1. Configure Vite Base Path
Edit `vite.config.ts` to set the base path:

```typescript
export default defineConfig(({ mode }) => ({
  base: "/gamename/",  // ← Add this line
  build: {
    outDir: "dist",
  },
  // ... rest of config
}));
```

### 2. Configure React Router Basename
Edit `src/App.tsx` to set the basename:

```typescript
<BrowserRouter basename="/gamename">  {/* ← Add basename prop */}
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

### 3. Build the Project
```bash
cd gamename
npm run build
```

### 4. Copy Build Files to Root
GitHub Pages serves from the folder root, not from `dist`:

```bash
cp dist/index.html .
cp -r dist/assets .
cp public/favicon.ico .
cp public/placeholder.svg .
cp public/robots.txt .
```

### 5. Include dist in Git
Remove `dist` from `.gitignore`:

```gitignore
node_modules
# dist  ← Comment out or remove this line
dist-ssr
*.local
```

### 6. Commit and Push
```bash
git add .
git commit -m "Add [Game Name] game"
git push
```

## Important Files Structure

After deployment, your game folder should look like:
```
gamename/
├── index.html          # Built HTML (in root, not just in dist/)
├── assets/            # Built assets (in root, not just in dist/)
│   ├── index-[hash].js
│   └── index-[hash].css
├── dist/              # Original build output (also committed)
│   ├── index.html
│   └── assets/
├── src/               # Source code
│   ├── App.tsx       # Contains BrowserRouter with basename
│   └── ...
├── public/
├── vite.config.ts    # Contains base path
└── package.json
```

## Troubleshooting

### White Screen
- ✅ Check `vite.config.ts` has `base: "/gamename/"`
- ✅ Verify build files are copied to root directory
- ✅ Check assets folder exists in root

### 404 Error (React Router)
- ✅ Check `<BrowserRouter basename="/gamename">` in App.tsx
- ✅ Clear browser cache (Ctrl+Shift+Delete)
- ✅ Wait 5-10 minutes for GitHub Pages to rebuild

### Assets Not Loading
- ✅ Check that `dist` is committed to git (not in .gitignore)
- ✅ Verify files exist on GitHub: `github.com/user/repo/tree/main/gamename/assets`

## Deployment Checklist

When adding a new React game:

- [ ] Add `base: "/gamename/"` to vite.config.ts
- [ ] Add `basename="/gamename"` to BrowserRouter in App.tsx
- [ ] Run `npm run build`
- [ ] Copy build files from dist/ to root directory
- [ ] Remove dist from .gitignore
- [ ] Add game to main index.html landing page
- [ ] Commit and push
- [ ] Wait 5-10 minutes for GitHub Pages deployment
- [ ] Test at https://gamingmcgamerson.com/gamename/

## Examples

See these working games for reference:
- [ballbouncingsandbox](../ballbouncingsandbox/)
- [clovercharmcollect](../clovercharmcollect/)

Both have the correct vite.config.ts and App.tsx configuration.
