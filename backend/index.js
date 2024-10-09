const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const { Kafka } = require('kafkajs');
const { getCreditRiskScore } = require('./mlModel');
const pool = require('./db');

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Empathic Credit System API is running');
});

const authMiddleware = (req, res, next) => {
    const auth = { login: 'admin', password: 'secret' };
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
    if (login && password && login === auth.login && password === auth.password) {
        return next();
    }
    res.set('WWW.Authenticate', 'Basic realm="401"');
    res.status(401).send('Authentication required.');
};

app.use(authMiddleware);

// mock
function calculateCreditLimit(emotionalState, financialThoughts) {
    const riskScore = getCreditRiskScore({ emotionalState, financialThoughts });
    const baseLimit = 10000;
    const adjustedLimit = baseLimit - riskScore * 100;
    return Math.floor(adjustedLimit);
}
// calcule limit credit endpoint
app.post('/credit-limit', async (req, res) => {
    try {
        const { emotionalState, financialThoughts } = req.body;
        const creditLimit = calculateCreditLimit(emotionalState, financialThoughts);
        const riskScore = getCreditRiskScore({ emotionalState, financialThoughts });

        await pool.query('UPDATE users SET risk_score = $1, credit_limit = $2 WHERE id = $3', [riskScore, creditLimit, userId]);

        res.json({ creditLimit });
    } catch (err) {
        console.error('Error calculating credit limit:', err);
        res.status(500).json({ error: 'internal server error' });
    }
});
// Kafka consumer configuration
const kafka = new Kafka({
    clientId: 'ecs-backend',
    brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'ecs-group' });

const runConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'emotional-data', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const emotionalData = message.value.toString();
            console.log(`Received message: $(emotionalData)`);
        },
    });
};

runConsumer().catch(console.error);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});