import type { ITimingObject } from 'timing-object';
import type { createSetTimingsrcWithCustomUpdateFunction } from '../factories/set-timingsrc-with-custom-update-function';
import { IUpdateVector } from '../interfaces';
import { TPrepareTimingStateVectorFunction, TPrepareUpdateVectorFunction, TUpdateFunction } from '../types';

export const createSetTimingsrc =
    <UpdateVectorWithCustomState extends IUpdateVector>(
        setTimingsrcWithCustomUpdateFunction: ReturnType<typeof createSetTimingsrcWithCustomUpdateFunction>,
        update: TUpdateFunction<UpdateVectorWithCustomState>
    ) =>
    (
        mediaElement: HTMLMediaElement,
        timingObject: ITimingObject,
        prepareTimingStateVector: null | TPrepareTimingStateVectorFunction = null,
        prepareUpdateVector: null | TPrepareUpdateVectorFunction = null
    ) =>
        setTimingsrcWithCustomUpdateFunction(mediaElement, timingObject, update, prepareTimingStateVector, prepareUpdateVector);
