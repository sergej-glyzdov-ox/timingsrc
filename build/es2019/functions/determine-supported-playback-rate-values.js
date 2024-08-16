const DEFAULT_VALUES = [Number.MIN_VALUE, Number.MAX_VALUE];
export const determineSupportedPlaybackRateValues = (window) => {
    if (window === null) {
        return DEFAULT_VALUES;
    }
    const audio = new window.Audio();
    try {
        // Bug #2: Chrome does not support values above 16.
        audio.playbackRate = 17;
    }
    catch {
        // Bug #1: Chrome does not support values below 0.0625.
        return [0.0625, 16];
    }
    try {
        // Bug #3: Firefox does not support negative values.
        audio.playbackRate = -1;
    }
    catch {
        return [0, DEFAULT_VALUES[1]];
    }
    return DEFAULT_VALUES;
};
//# sourceMappingURL=determine-supported-playback-rate-values.js.map