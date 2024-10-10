jest.mock('../db', () => ({
    pool: {
        query: jest.fn(),
    },
    updateCreditLimitAndRisk: jest.fn(),
    getUserTransactions: jest.fn(),
}));

const { updateCreditLimitAndRisk, getUserTransactions, pool } = require('../db');
const { stopConsumer } = require('../index');

jest.setTimeout(30000);

describe('Database updates', () => {
    it('should update credit limit and risk score in the database', async () => {
        const mockQuery = pool.query;
        mockQuery.mockResolvedValueOnce({ rowCount: 1 });

        updateCreditLimitAndRisk.mockImplementation(async (userId, creditLimit, riskScore) => {
            await pool.query('UPDATE users SET risk_score = $1, credit_limit = $2 WHERE id = $3', [riskScore, creditLimit, userId]);
        });

        await updateCreditLimitAndRisk(1, 5000, 75);

        expect(mockQuery).toHaveBeenCalledWith(
            'UPDATE users SET risk_score = $1, credit_limit = $2 WHERE id = $3',
            [75, 5000, 1]
        );
    });

    it('should fetch user transactions from the database', async () => {
        const mockQuery = pool.query;
        const mockTransactions = [{ id: 1, amount: 200, user_id: 1 }];

        mockQuery.mockResolvedValueOnce({ rows: mockTransactions });

        getUserTransactions.mockImplementation(async (userId) => {
            const result = await pool.query('SELECT * FROM transactions WHERE user_id = $1', [userId]);
            return result.rows;
        });

        const transactions = await getUserTransactions(1);

        expect(transactions).toEqual(mockTransactions);

        expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM transactions WHERE user_id = $1', [1]);
    });

    afterEach(async () => {
        console.log('Stopping consumer after each test...');
        await stopConsumer();
    });

    afterAll(async () => {
        console.log('Stopping consumer after all tests...');
        await stopConsumer();
    });
});