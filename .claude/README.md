# Claude Code Project Notes

This is the gamingmcgamerson.com gaming hub repository.

## Important Documentation

When working on this project, **always check these files first**:

### 📚 Deployment Guides
- **[REACT_DEPLOYMENT_NOTES.md](REACT_DEPLOYMENT_NOTES.md)** - Complete guide for deploying React/Vite games to GitHub Pages subdirectories
  - Read this BEFORE deploying any new React game
  - Contains step-by-step instructions, troubleshooting, and checklist
  - Covers vite.config.ts base path and React Router basename configuration

## Project Structure

```
gamingmcgamerson/
├── index.html              # Main landing page (pixel art theme)
├── CNAME                   # Custom domain: gamingmcgamerson.com
├── .claude/
│   ├── README.md          # This file
│   └── REACT_DEPLOYMENT_NOTES.md  # React deployment guide
├── ballbouncingsandbox/   # React game (example)
├── clovercharmcollect/    # React game (example)
├── colorguesser/          # HTML/JS game
├── snaketris/            # HTML/JS game
├── canyoulickit/         # HTML/JS game
└── doubletrouble/        # HTML/JS game
```

## Game Types

1. **Simple HTML/JS games** (colorguesser, snaketris, etc.)
   - Just add folder with index.html
   - Link from main index.html
   - Commit and push

2. **React/Vite games** (ballbouncingsandbox, clovercharmcollect)
   - See REACT_DEPLOYMENT_NOTES.md for full process
   - Requires vite.config.ts and React Router basename configuration
   - Build files must be copied to root directory

## Deployment

- **GitHub Pages** serves from `main` branch root
- **Custom domain**: gamingmcgamerson.com (configured in CNAME)
- Games are at: `https://gamingmcgamerson.com/gamename/`
- GitHub Pages rebuilds in ~5-10 minutes after push

## Common Tasks

### Adding a new game to the landing page
Edit [index.html](../index.html) and add a new game box in the games-container div

### Deploying a React game
Follow the checklist in [REACT_DEPLOYMENT_NOTES.md](REACT_DEPLOYMENT_NOTES.md)

### Troubleshooting deployments
Check [REACT_DEPLOYMENT_NOTES.md](REACT_DEPLOYMENT_NOTES.md) troubleshooting section
