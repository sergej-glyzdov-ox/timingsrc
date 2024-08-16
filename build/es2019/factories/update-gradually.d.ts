import type { determineSupportedPlaybackRateValues } from '../functions/determine-supported-playback-rate-values';
import { IUpdateVector } from '../interfaces';
import { TUpdateFunction } from '../types';
import type { createComputeVelocity } from './compute-velocity';
export declare const createUpdateGradually: (computeVelocity: ReturnType<typeof createComputeVelocity>, [minValue, maxValue]: ReturnType<typeof determineSupportedPlaybackRateValues>, threshold: number, tolerance: number) => TUpdateFunction<IUpdateVector & {
    mediaElementDelay: number;
}>;
//# sourceMappingURL=update-gradually.d.ts.map