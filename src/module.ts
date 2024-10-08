import { animationFrame, on } from 'subscribable-things';
import { translateTimingStateVector } from 'timing-object';
import { createComputeVelocity } from './factories/compute-velocity';
import { createDefaultSetTimingsrc } from './factories/default-set-timingsrc';
import { createSetCurrentTime } from './factories/set-current-time';
import { createSetPlaybackRate } from './factories/set-playback-rate';
import { createSetTimingsrc } from './factories/set-timingsrc';
import { createSetTimingsrcWithCustomUpdateFunction } from './factories/set-timingsrc-with-custom-update-function';
import { createUpdateGradually } from './factories/update-gradually';
import { createUpdateMediaElement } from './factories/update-media-element';
import { createUpdateStepwiseFactory } from './factories/update-stepwise-factory';
import { createWindow } from './factories/window';
import { determineSupportedPlaybackRateValues } from './functions/determine-supported-playback-rate-values';
import { pause } from './functions/pause';
import { play } from './functions/play';
import 'core-js/actual';

export { createSetTimingsrc };

export { createUpdateGradually };

export const createUpdateStepwise = createUpdateStepwiseFactory(translateTimingStateVector);

const updateMediaElement = createUpdateMediaElement(
    pause,
    play,
    createSetCurrentTime(new WeakMap()),
    createSetPlaybackRate(881 / 882, new WeakMap(), 882 / 881)
);

export const setTimingsrcWithCustomUpdateFunction = createSetTimingsrcWithCustomUpdateFunction(
    animationFrame,
    clearInterval,
    document,
    on,
    setInterval,
    updateMediaElement
);

export const setTimingsrc = createDefaultSetTimingsrc(
    createComputeVelocity,
    createSetTimingsrc,
    createUpdateGradually,
    createUpdateStepwise,
    determineSupportedPlaybackRateValues,
    setTimingsrcWithCustomUpdateFunction,
    createWindow()
);
