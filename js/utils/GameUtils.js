export const GameUtils = {
    formatNumber(num) {
        return new Intl.NumberFormat('es-ES').format(num);
    },

    calculatePercentage(part, total) {
        if (total === 0) return 0;
        return Math.round((part / total) * 100);
    },

    checkBrowserSupport() {
        const features = {
            css3d: 'transform-style' in document.body.style,
            css3: 'borderRadius' in document.body.style,
            es6: typeof Symbol !== 'undefined'
        };

        const unsupported = Object.keys(features).filter((feature) => !features[feature]);
        if (unsupported.length > 0) {
            console.warn('Some features are not supported:', unsupported);
        }
        return unsupported.length === 0;
    },

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
};
