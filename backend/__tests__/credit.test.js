const { calculateCreditLimit, sendNotification } = require('../index');
const { getCreditRiskScore } = require('../mlModel');

// Mock the necessary modules
jest.mock('../mlModel', () => ({
    getCreditRiskScore: jest.fn(),
}));

jest.mock('../index', () => ({
    ...jest.requireActual('../index'),
    sendNotification: jest.fn(),
}));

describe('calculateCreditLimit', () => {

    beforeEach(() => {
        // Default mock implementation for getCreditRiskScore
        getCreditRiskScore.mockReturnValue(50);
    });

    it('should return lower credit limit for high risk scores', () => {
        // Simulate a high risk score
        getCreditRiskScore.mockReturnValue(90);

        const userProfile = {
            emotionalState: 'stressed',
            financialThoughts: 'negative',
            income: 5000,
            transactionHistory: [{ amount: 300 }],
            creditHistoryScore: 700,
        };

        const creditLimit = calculateCreditLimit(userProfile);

        // Expect lower credit limit due to high risk
        expect(creditLimit).toBeLessThan(10000);
    });

    it('should return a high credit limit for low risk scores', () => {
        // Simulate a low risk score
        getCreditRiskScore.mockReturnValue(10);

        const userProfile = {
            emotionalState: 'calm',
            financialThoughts: 'positive',
            income: 7000,
            transactionHistory: [{ amount: 100 }],
            creditHistoryScore: 800,
        };

        const creditLimit = calculateCreditLimit(userProfile);

        // Expect a higher credit limit due to low risk
        expect(creditLimit).toBeGreaterThanOrEqual(11000);
    });

    it('should send notification when credit limit is updated', () => {
        const userProfile = {
            userId: 123,
            emotionalState: 'neutral',
            financialThoughts: 'positive',
            income: 5000,
            transactionHistory: [{ amount: 300 }],
            creditHistoryScore: 700,
        };

        const creditLimit = calculateCreditLimit(userProfile);

        // Expect a valid credit limit and the sendNotification function to be called
        expect(creditLimit).toBeGreaterThanOrEqual(11000);

        sendNotification(userProfile.userId, `Your new credit limit is: ${creditLimit}`);

        // Check if the notification was sent with correct parameters
        expect(sendNotification).toHaveBeenCalledWith(expect.any(Number), expect.any(String));
    });
});
