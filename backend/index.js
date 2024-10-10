const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const { Kafka } = require('kafkajs');
const { getCreditRiskScore } = require('./mlModel');
const pool = require('./db');

app.use(express.json());
// Root route for basic health check
app.get('/', (req, res) => {
    res.send('Empathic Credit System API is running');
});
// Basic auth middleware
const authMiddleware = (req, res, next) => {
    const auth = { login: 'admin', password: 'secret' };
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    // Check if credentials match
    if (login && password && login === auth.login && password === auth.password) {
        return next();
    }
    res.set('WWW.Authenticate', 'Basic realm="401"');
    res.status(401).send('Authentication required.');
};

app.use(authMiddleware);

// Mock function to calculate credit limit based on emotional and financial data
function calculateCreditLimit(emotionalState, financialThoughts) {
    const riskScore = getCreditRiskScore({ emotionalState, financialThoughts });
    const baseLimit = 10000;
    const riskAdjustmentFactor = 100;
    const adjustedLimit = baseLimit - (riskScore * riskAdjustmentFactor)

    return Math.max(Math.floor(adjustedLimit), 0);
}

// Endpoint to calculate and update the credit limit
app.post('/credit-limit', async (req, res) => {
    try {
        const { emotionalState, financialThoughts, userId } = req.body;
        const creditLimit = calculateCreditLimit(emotionalState, financialThoughts);
        const riskScore = getCreditRiskScore({ emotionalState, financialThoughts });

        // Update user data with the new risk score and credit limit in the database
        await pool.query('UPDATE users SET risk_score = $1, credit_limit = $2 WHERE id = $3', [riskScore, creditLimit, userId]);
        res.json({ creditLimit });
    } catch (err) {
        console.error('Error calculating credit limit:', err);
        res.status(500).json({ error: 'internal server error' });
    }
});
// Kafka consumer configuration to listen to "emotional-data" topic
const kafka = new Kafka({
    clientId: 'ecs-backend',
    brokers: ['localhost:9092']
});

let consumer;

// Start the Kafka consumer
const startConsumer = async () => {
    try {
        consumer = kafka.consumer({ groupId: 'ecs-group' });
        await consumer.subscribe({ topic: 'emotional-data', fromBeginning: true });

        // Listen for new messages from Kafka
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log(`Received message: ${message.value}`);
                // Process the message...
            },
        });
        console.log('Kafka consumer started');
    } catch (err) {
        console.error('Error starting Kafka consumer', err);
    }
};

// Stop the Kafka consumer
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

// Start the Kafka consumer
if (process.env.NODE_ENV !== 'test') {
    startConsumer().catch(console.error);
}

// Disconnect the consumer when the process exits
process.on('beforeExit', async () => {
    await stopConsumer();
});

// Start the Express server
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export the app and functions for testing
module.exports = { app, calculateCreditLimit, startConsumer, stopConsumer };