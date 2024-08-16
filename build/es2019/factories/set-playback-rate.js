export const createSetPlaybackRate = (negativeMaximum, playbackRateAssignments, positiveMinimum) => {
    return (mediaElement, previousValue, nextValue) => {
        const playbackRateAssignment = playbackRateAssignments.get(mediaElement);
        if (playbackRateAssignment === undefined ||
            playbackRateAssignment[0] !== previousValue ||
            playbackRateAssignment[1] !== nextValue) {
            // Bug #6: Chrome does not adjust the tempo when the playbackRate is very close to 1.
            console.log('nextValue', nextValue);
            console.log('min-max = ', positiveMinimum, negativeMaximum);
            mediaElement.playbackRate = nextValue > 1 ? Math.max(positiveMinimum, nextValue) : Math.min(negativeMaximum, nextValue);
            playbackRateAssignments.set(mediaElement, [mediaElement.playbackRate, nextValue]);
        }
    };
};
//# sourceMappingURL=set-playback-rate.js.map