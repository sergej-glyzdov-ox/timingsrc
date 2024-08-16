export const createComputeVelocity = (timeConstant) => (delta, minValue, maxValue, velocity) => {
    const factor = (Math.abs(delta) + timeConstant) / timeConstant;
    return Math.max(minValue, Math.min(maxValue, delta > 0 ? velocity / factor : factor * velocity));
};
//# sourceMappingURL=compute-velocity.js.map