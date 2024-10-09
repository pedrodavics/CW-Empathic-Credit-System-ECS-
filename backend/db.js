const { Pool } = require('pg');
const pool = new Pool({
    user: 'user',
    host: 'localhost',
    database: 'ecs',
    password: 'password',
    port: 5432,
});

const updateCreditLimitAndRisk async (userID, CreditLimit, riskScore) => {
    try {
        await pool.query('UPDATE users SET risk_score = $1, credit_limit = $2 WHERE id = $3', [riskScore, creditLimit, userId]);
    } catch (error) {
        console.error('Error updating credit limit and risk score:', error);
        throw error;
    }
};

module.exports = {
    pool,
    updateCreditLimitAndRisk,
};