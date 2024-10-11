const { getCreditRiskScore } = require('../mlModel');

describe('getCreditRiskScore', () => {
    it('should return a numeric risk score between 0 and 100', () => {
        const features = {
            emotionalState: 'anxious',
            financialThoughts: 'neutral',
            income: 2500,
            creditHistoryScore: 500
        };

        const riskScore = getCreditRiskScore(features);

        // Check if the result is a number and within the expected range
        expect(typeof riskScore).toBe('number');
        expect(riskScore).toBeGreaterThanOrEqual(0);
        expect(riskScore).toBeLessThanOrEqual(100);
    });
});
