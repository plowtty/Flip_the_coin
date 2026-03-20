export class Coin {
    constructor(initialStats = null) {
        this.stats = {
            total: 0,
            heads: 0,
            tails: 0
        };

        if (initialStats) {
            this.setStats(initialStats);
        }
    }

    flip() {
        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        this.updateStats(result);
        return result;
    }

    updateStats(result) {
        this.stats.total++;
        if (result === 'heads') {
            this.stats.heads++;
        } else {
            this.stats.tails++;
        }
    }

    setStats(stats) {
        const total = Number.isFinite(stats?.total) ? Math.max(0, stats.total) : 0;
        const heads = Number.isFinite(stats?.heads) ? Math.max(0, stats.heads) : 0;
        const tails = Number.isFinite(stats?.tails) ? Math.max(0, stats.tails) : 0;

        if (heads + tails !== total) {
            this.stats = {
                total: heads + tails,
                heads,
                tails
            };
            return;
        }

        this.stats = {
            total,
            heads,
            tails
        };
    }

    getStats() {
        return {
            ...this.stats,
            headsPercentage: this.stats.total > 0
                ? Math.round((this.stats.heads / this.stats.total) * 100)
                : 0
        };
    }

    resetStats() {
        this.stats = {
            total: 0,
            heads: 0,
            tails: 0
        };
    }
}
