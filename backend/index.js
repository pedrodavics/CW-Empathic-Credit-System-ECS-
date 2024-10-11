const express = require('express');
const { Kafka } = require('kafkajs');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

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

// Routes
app.get('/', (req, res) => {
    res.send('Empathic Credit System API is running');
});

app.get('/transactions/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const transactions = await pool.query('SELECT * FROM transactions WHERE user_id = $1', [userId]);
        res.json(transactions.rows);
    } catch (err) {
        console.error('Error fetching transactions:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/credit-limit', async (req, res) => {
    try {
        const { emotionalState, financialThoughts, income, userId, transactionAmount, transactionDescription, creditHistoryScore } = req.body;

        const userProfile = {
            emotionalState,
            financialThoughts,
            income,
            transactionHistory: [{ amount: transactionAmount }],
            creditHistoryScore
        };

        const creditLimit = calculateCreditLimit(userProfile);
        const riskScore = getCreditRiskScore(userProfile);

        await pool.query(
            'UPDATE users SET risk_score = $1, credit_limit = $2 WHERE id = $3',
            [riskScore, creditLimit, userId]
        );

        await pool.query(
            'INSERT INTO transactions (user_id, amount, description) VALUES ($1, $2, $3)',
            [userId, transactionAmount, transactionDescription]
        );

        sendNotification(userId, `Your new credit limit is: ${creditLimit}`);
        res.json({ creditLimit });
    } catch (err) {
        console.error('Error calculating credit limit:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Helper functions
function calculateCreditLimit(userProfile) {
    const { emotionalState, financialThoughts, income, transactionHistory = [], creditHistoryScore } = userProfile;
    const riskScore = getCreditRiskScore(userProfile);

    const baseLimit = 15000;
    const riskAdjustmentFactor = 100;
    const lastTransactionAmount = transactionHistory.length > 0 ? transactionHistory[transactionHistory.length - 1].amount : 0;
    const transactionImpact = lastTransactionAmount * 0.002;

    let adjustedLimit = baseLimit - (riskScore * riskAdjustmentFactor) - transactionImpact;
    adjustedLimit = Math.max(500, Math.min(adjustedLimit, 15000));

    return Math.floor(adjustedLimit);
}

function getCreditRiskScore(features) {
    const { emotionalState, financialThoughts, income, creditHistoryScore } = features;

    let baseScore = Math.random() * 100;
    if (emotionalState === 'anxious') baseScore -= 10;
    if (financialThoughts === 'neutral') baseScore += 5;
    if (income < 3000) baseScore -= 20;
    if (creditHistoryScore < 600) baseScore -= 30;

    return Math.max(0, Math.min(Math.floor(baseScore), 100));
}

const sendNotification = (userId, message) => {
    console.log(`Notification to user ${userId}: ${message}`);
};

// Kafka Consumer
const kafka = new Kafka({
    clientId: 'ecs-backend',
    brokers: ['localhost:9092']
});

let consumer;

const startConsumer = async () => {
    try {
        consumer = kafka.consumer({ groupId: 'ecs-group' });
        await consumer.subscribe({ topic: 'emotional-data', fromBeginning: true });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log(`Received message: ${message.value}`);
            },
        });
        console.log('Kafka consumer started');
    } catch (err) {
        console.error('Error starting Kafka consumer', err);
    }
};

const stopConsumer = async () => {
    if (consumer) {
        try {
            await consumer.disconnect();
            console.log('Kafka consumer disconnected');
        } catch (err) {
            console.error('Error disconnecting Kafka consumer', err);
        }
    }
};

// Start server and Kafka consumer
if (process.env.NODE_ENV !== 'test') {
    startConsumer().catch(console.error);
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Cleanup before exit
process.on('beforeExit', async () => {
    await stopConsumer();
});

// Export app and functions for testing
module.exports = { app, calculateCreditLimit, sendNotification, startConsumer, stopConsumer };
