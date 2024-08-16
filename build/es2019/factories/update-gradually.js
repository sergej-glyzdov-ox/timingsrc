export const createUpdateGradually = (computeVelocity, [minValue, maxValue], threshold, tolerance) => {
    return ({ position, velocity }, currentTime, previousUpdateVectorWithCustomState) => {
        let { mediaElementDelay } = previousUpdateVectorWithCustomState !== null && previousUpdateVectorWithCustomState !== void 0 ? previousUpdateVectorWithCustomState : { mediaElementDelay: 0 };
        if (velocity < minValue || velocity > maxValue) {
            return { mediaElementDelay, position, velocity: 0 };
        }
        if (position < 0 || velocity === 0) {
            return { mediaElementDelay, position, velocity };
        }
        const positionDifference = currentTime - position;
        const absolutePositionDifference = Math.abs(positionDifference);
        if (absolutePositionDifference > threshold) {
            const { position: lastPosition } = previousUpdateVectorWithCustomState !== null && previousUpdateVectorWithCustomState !== void 0 ? previousUpdateVectorWithCustomState : { position: null };
            if (positionDifference < 0 || positionDifference > mediaElementDelay) {
                if (lastPosition === currentTime) {
                    mediaElementDelay += absolutePositionDifference;
                }
                return { mediaElementDelay, position: position + mediaElementDelay, velocity };
            }
            if (lastPosition !== currentTime) {
                mediaElementDelay -= absolutePositionDifference;
                return { mediaElementDelay, position: position + mediaElementDelay, velocity };
            }
        }
        if (absolutePositionDifference > tolerance) {
            return {
                mediaElementDelay,
                position: currentTime,
                velocity: computeVelocity(positionDifference, minValue, maxValue, velocity)
            };
        }
        return { mediaElementDelay, position: currentTime, velocity };
    };
};
//# sourceMappingURL=update-gradually.js.map