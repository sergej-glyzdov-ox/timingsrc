import type { TAnimationFrameFunction, TOnFunction } from 'subscribable-things';
import type { ITimingObject } from 'timing-object';
import { IUpdateVector } from '../interfaces';
import { TPrepareTimingStateVectorFunction, TPrepareUpdateVectorFunction, TUpdateFunction } from '../types';
import type { createUpdateMediaElement } from './update-media-element';
export declare const createSetTimingsrcWithCustomUpdateFunction: (animationFrame: TAnimationFrameFunction, clearInterval: Window["clearInterval"], document: Document, on: TOnFunction, setInterval: Window["setInterval"], updateMediaElement: ReturnType<typeof createUpdateMediaElement>) => <UpdateVectorWithCustomState extends IUpdateVector>(mediaElement: HTMLMediaElement, timingObject: ITimingObject, updateFunction: TUpdateFunction<UpdateVectorWithCustomState>, prepareTimingStateVector?: null | TPrepareTimingStateVectorFunction, prepareUpdateVector?: null | TPrepareUpdateVectorFunction) => () => void;
//# sourceMappingURL=set-timingsrc-with-custom-update-function.d.ts.map