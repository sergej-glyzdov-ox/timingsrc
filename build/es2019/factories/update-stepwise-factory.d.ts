import type { TTranslateTimingStateVectorFunction } from 'timing-object';
import { IUpdateVector } from '../interfaces';
import { TUpdateFunction } from '../types';
export declare const createUpdateStepwiseFactory: (translateTimingStateVector: TTranslateTimingStateVectorFunction) => (tolerance: number) => TUpdateFunction<IUpdateVector & {
    lastAppliedPostion: number;
    lastAppliedTimestamp: number;
    lastAppliedVelocity: number;
    lastPlayheadDifference: number;
    mediaElementDelay: number;
    numberOfDetectedResets: number;
    numberOfExpectedResets: number;
}>;
//# sourceMappingURL=update-stepwise-factory.d.ts.map