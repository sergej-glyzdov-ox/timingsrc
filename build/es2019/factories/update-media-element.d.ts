import type { pause as pauseFunction } from '../functions/pause';
import type { play as playFunction } from '../functions/play';
import type { createSetCurrentTime } from './set-current-time';
import type { createSetPlaybackRate } from './set-playback-rate';
export declare const createUpdateMediaElement: (pause: typeof pauseFunction, play: typeof playFunction, setCurrentTime: ReturnType<typeof createSetCurrentTime>, setPlaybackRate: ReturnType<typeof createSetPlaybackRate>) => (currentTime: number, duration: number, mediaElement: HTMLMediaElement, playbackRate: number, position: number, velocity: number) => void;
//# sourceMappingURL=update-media-element.d.ts.map