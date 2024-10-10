const { Pool } = require('pg');
const pool = new Pool({
    user: 'user',
    host: 'localhost',
    database: 'ecs',
    password: 'password',
    port: 5432,
});

const updateCreditLimitAndRisk = async (userId, creditLimit, riskScore) => {
    try {
        await pool.query('UPDATE users SET risk_score = $1, credit_limit = $2 WHERE id = $3', [riskScore, creditLimit, userId]);
    } catch (error) {
        console.error('Error updating credit limit and risk score:', error);
        throw error;
    }
};

const getUserTransactions = async (userId) => {
    try {
        const result = await pool.query('SELECT * FROM transactions WHERE user_id = $1', [userId]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }
};


module.exports = {
    pool,
    updateCreditLimitAndRisk,
    getUserTransactions,
};