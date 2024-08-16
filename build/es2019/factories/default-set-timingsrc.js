const DEFAULT_THRESHOLD = 1;
const DEFAULT_TIME_CONSTANT = 0.5;
const DEFAULT_TOLERANCE = 0.025;
export const createDefaultSetTimingsrc = (createComputeVelocity, createSetTimingsrc, createUpdateGradually, createUpdateStepwise, determineSupportedPlaybackRateValues, setTimingsrcWithCustomUpdateFunction, window) => {
    console.log('createUpdateStepwise', createUpdateStepwise);
    const update = createUpdateGradually(createComputeVelocity(DEFAULT_TIME_CONSTANT), determineSupportedPlaybackRateValues(window), DEFAULT_THRESHOLD, DEFAULT_TOLERANCE);
    return createSetTimingsrc(setTimingsrcWithCustomUpdateFunction, update);
};
//# sourceMappingURL=default-set-timingsrc.js.map