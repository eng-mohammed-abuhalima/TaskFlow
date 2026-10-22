import { Composition, continueRender, delayRender } from 'remotion';
import { TaskFlowVideo, TOTAL } from './TaskFlowVideo.jsx';
import { fontsReady } from './theme.js';

// Hold rendering until the fonts are in, so no frame shows a fallback font.
const handle = delayRender('Loading fonts');
fontsReady.then(() => continueRender(handle));

export function Root() {
  const common = { component: TaskFlowVideo, durationInFrames: TOTAL, fps: 30, width: 1920, height: 1080 };
  return (
    <>
      <Composition id="TaskFlowAr" {...common} defaultProps={{ lang: 'ar' }} />
      <Composition id="TaskFlowEn" {...common} defaultProps={{ lang: 'en' }} />
    </>
  );
}
