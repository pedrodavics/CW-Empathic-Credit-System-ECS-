const { getCreditRiskScore } = require('../mlModel');

describe('getCreditRiskScore', () => {
    it('should return a numeric risk score between 0 and 100', () => {
        const emotionalState = 'anxious';
        const financialThoughts = 'neutral';

        const riskScore = getCreditRiskScore({ emotionalState, financialThoughts });

        expect(typeof riskScore).toBe('number');
        expect(riskScore).toBeGreaterThanOrEqual(0);
        expect(riskScore).toBeLessThanOrEqual(100);
    });
});