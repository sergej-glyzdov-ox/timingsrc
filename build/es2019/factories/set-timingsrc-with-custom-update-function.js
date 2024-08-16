export const createSetTimingsrcWithCustomUpdateFunction = (animationFrame, clearInterval, document, on, setInterval, updateMediaElement) => {
    return (mediaElement, timingObject, updateFunction, prepareTimingStateVector = null, prepareUpdateVector = null) => {
        let previousUpdateVectorWithCustomState = null;
        const update = () => {
            const { currentTime, duration, playbackRate } = mediaElement;
            const timingStateVector = timingObject.query();
            previousUpdateVectorWithCustomState = updateFunction(prepareTimingStateVector === null ? timingStateVector : prepareTimingStateVector(timingStateVector), currentTime, previousUpdateVectorWithCustomState);
            const sanitizedDuration = typeof duration === 'number' && !isNaN(duration) ? duration : 0;
            const { position, velocity } = prepareUpdateVector === null
                ? previousUpdateVectorWithCustomState
                : prepareUpdateVector(previousUpdateVectorWithCustomState);
            previousUpdateVectorWithCustomState = { ...previousUpdateVectorWithCustomState, position, velocity };
            updateMediaElement(currentTime, sanitizedDuration, mediaElement, playbackRate, position, velocity);
            return velocity !== 0;
        };
        let unsubscribe;
        const updateOnce = () => {
            if (!update()) {
                unsubscribe();
                unsubscribe = updateReactively();
            }
        };
        const updateConsistently = () => {
            let intervalId = setInterval(() => updateOnce(), 100);
            const restartInterval = () => {
                clearInterval(intervalId);
                intervalId = setInterval(() => updateOnce(), 100);
            };
            const unsubscribeFunctions = [
                () => clearInterval(intervalId),
                animationFrame()(() => {
                    restartInterval();
                    updateOnce();
                }),
                on(timingObject, 'change')(() => {
                    if (document.visibilityState === 'hidden') {
                        restartInterval();
                        updateOnce();
                    }
                })
            ];
            return () => unsubscribeFunctions.forEach((unsubscribeFunction) => unsubscribeFunction());
        };
        const updateReactively = () => on(timingObject, 'change')(() => {
            if (update()) {
                unsubscribe();
                unsubscribe = updateConsistently();
            }
        });
        unsubscribe = update() ? updateConsistently() : updateReactively();
        return () => unsubscribe();
    };
};
//# sourceMappingURL=set-timingsrc-with-custom-update-function.js.map