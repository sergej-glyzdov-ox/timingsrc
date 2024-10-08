export const createSetPlaybackRate = (
    negativeMaximum: number,
    playbackRateAssignments: WeakMap<HTMLMediaElement, [number, number]>,
    positiveMinimum: number
) => {
    return (mediaElement: HTMLMediaElement, previousValue: number, nextValue: number) => {
        const playbackRateAssignment = playbackRateAssignments.get(mediaElement);

        if (
            playbackRateAssignment === undefined ||
            playbackRateAssignment[0] !== previousValue ||
            playbackRateAssignment[1] !== nextValue
        ) {
            // Bug #6: Chrome does not adjust the tempo when the playbackRate is very close to 1.

            console.log('nextValue', nextValue);

            mediaElement.playbackRate = Math.min(nextValue > 1 ? Math.max(positiveMinimum, nextValue) : Math.min(negativeMaximum, nextValue), 2);

            playbackRateAssignments.set(mediaElement, [mediaElement.playbackRate, nextValue]);
        }
    };
};
