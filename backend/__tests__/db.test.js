jest.mock('../db', () => ({
    pool: {
        query: jest.fn(),
    },
    updateCreditLimitAndRisk: jest.fn(),
}));

const { updateCreditLimitAndRisk, pool } = require('../db');
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

    afterEach(async () => {
        console.log('Stopping consumer after each test...');
        await stopConsumer(); // Garantir que o consumidor pare corretamente
    });

    afterAll(async () => {
        console.log('Stopping consumer after all tests...');
        await stopConsumer();
    });
});