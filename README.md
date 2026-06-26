# The Last Signal — Vite + React

A faithful React port of the original static site. All HTML was ported into a React component, the CSS (keyframes, resets, scrollbars) moved unchanged into `src/index.css`, and `scripts.js` (game text + canvas starfield/globe) wired in as a module.

## Run

```bash
npm install
npm run dev      # start dev server
npm run build    # production build -> dist/
npm run preview  # preview the build
```

## Structure
- `index.html` — entry, loads Google Fonts + `/src/main.jsx`
- `src/main.jsx` — React root, imports CSS + scripts
- `src/App.jsx` — the full UI ported to React (logic class + JSX)
- `src/index.css` — original keyframes, resets, scrollbar styles + ported hover/focus states
- `src/scripts.js` — `window.LS_SCRIPTS` mission text
- `public/assets/` — logos
