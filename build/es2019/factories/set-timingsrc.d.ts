import type { ITimingObject } from 'timing-object';
import type { createSetTimingsrcWithCustomUpdateFunction } from '../factories/set-timingsrc-with-custom-update-function';
import { IUpdateVector } from '../interfaces';
import { TPrepareTimingStateVectorFunction, TPrepareUpdateVectorFunction, TUpdateFunction } from '../types';
export declare const createSetTimingsrc: <UpdateVectorWithCustomState extends IUpdateVector>(setTimingsrcWithCustomUpdateFunction: ReturnType<typeof createSetTimingsrcWithCustomUpdateFunction>, update: TUpdateFunction<UpdateVectorWithCustomState>) => (mediaElement: HTMLMediaElement, timingObject: ITimingObject, prepareTimingStateVector?: null | TPrepareTimingStateVectorFunction, prepareUpdateVector?: null | TPrepareUpdateVectorFunction) => () => void;
//# sourceMappingURL=set-timingsrc.d.ts.map