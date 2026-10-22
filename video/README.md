# TaskFlow promo video

A 30-second promo (1920x1080, 30 fps) in Arabic and English, built with [Remotion](https://www.remotion.dev).

## Run it

```bash
npm install
npm run studio     # preview and tweak in the browser
npm run render     # writes out/taskflow-ar.mp4 and out/taskflow-en.mp4
```

## Update the screenshots

1. Start the app (`npm run dev` in the repo root).
2. `APP_URL=http://localhost:5173 npm run capture`.
   An Edge window opens; sign in with the owner demo account if asked (email and password, not Google).
3. Shots land in `public/shots/` (`ar-*` and `en-*`).

## Where things are

- `src/copy.js`: every line of text, per language.
- `src/TaskFlowVideo.jsx`: scene order and lengths (`D`), zoom and focus per scene.
- `src/parts.jsx`: logo animation, browser and phone frames, captions.
- `src/theme.js`: colours and fonts from the app's design system.
- Music: put a royalty-free track at `public/music.mp3` and set `MUSIC = 'music.mp3'` in `src/TaskFlowVideo.jsx`.
