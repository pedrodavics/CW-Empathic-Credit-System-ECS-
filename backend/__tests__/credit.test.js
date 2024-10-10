const { calculateCreditLimit } = require('../index');
const { getCreditRiskScore } = require('../mlModel');

jest.mock('../mlModel', () => ({
    getCreditRiskScore: jest.fn(),
}));

describe('calculateCreditLimit', () => {
    beforeEach(() => {
        require('../mlModel').getCreditRiskScore.mockReturnValue(50);
    });

    it('should return lower credit limit for high risk scores', () => {
        const emotionalState = 'stressed';
        const financialThoughts = 'negative';

        const creditLimit = calculateCreditLimit(emotionalState, financialThoughts);
        expect(creditLimit).toBeLessThan(10000);
    });

    it('should return a high credit limit for low risk scores', () => {
        require('../mlModel').getCreditRiskScore.mockReturnValue(10);

        const emotionalState = 'calm';
        const financialThoughts = 'positive';

        const creditLimit = calculateCreditLimit(emotionalState, financialThoughts);
        expect(creditLimit).toBeGreaterThanOrEqual(8000);
    });
});
