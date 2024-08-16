export const play = (mediaElement) => {
    if (mediaElement.paused) {
        mediaElement.play().catch((err) => console.error(err)); // tslint:disable-line no-console
    }
};
//# sourceMappingURL=play.js.map