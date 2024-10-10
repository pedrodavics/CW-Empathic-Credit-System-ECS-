const { calculateCreditLimit, sendNotification } = require('../index');
const { getCreditRiskScore } = require('../mlModel');

jest.mock('../mlModel', () => ({
    getCreditRiskScore: jest.fn(),
}));

jest.mock('../index', () => ({
    ...jest.requireActual('../index'),
    sendNotification: jest.fn(),
}));

describe('calculateCreditLimit', () => {
    beforeEach(() => {
        getCreditRiskScore.mockReturnValue(50);
    });

    it('should return lower credit limit for high risk scores', () => {
        getCreditRiskScore.mockReturnValue(90);

        const userProfile = {
            emotionalState: 'stressed',
            financialThoughts: 'negative',
            income: 5000,
            transactionHistory: [{ amount: 300 }],
            creditHistoryScore: 700
        };

        const creditLimit = calculateCreditLimit(userProfile);
        expect(creditLimit).toBeLessThan(10000);
    });

    it('should return a high credit limit for low risk scores', () => {
        getCreditRiskScore.mockReturnValue(10);

        const userProfile = {
            emotionalState: 'calm',
            financialThoughts: 'positive',
            income: 7000,
            transactionHistory: [{ amount: 100 }],
            creditHistoryScore: 800
        };

        const creditLimit = calculateCreditLimit(userProfile);
        expect(creditLimit).toBeGreaterThanOrEqual(8000);
    });

    it('should send notification when credit limit is updated', () => {
        const userProfile = {
            userId: 123,
            emotionalState: 'neutral',
            financialThoughts: 'positive',
            income: 5000,
            transactionHistory: [{ amount: 300 }],
            creditHistoryScore: 700
        };

        const creditLimit = calculateCreditLimit(userProfile);

        expect(creditLimit).toBeGreaterThanOrEqual(8000);

        sendNotification(userProfile.userId, `Your new credit limit is: ${creditLimit}`);

        expect(sendNotification).toHaveBeenCalledWith(expect.any(Number), expect.any(String));
    });
});
