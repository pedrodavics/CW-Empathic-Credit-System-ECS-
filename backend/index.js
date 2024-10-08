const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const { Kafka } = require('kafkajs');

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Empathic Credit System API is running');
});
// mock
function calculateCreditLimit(emotionalState, financialThoughts) {
    return Math,floor(Math.random() * 10000);
}
// calcule limit credit endpoint
app.post('/credit-limit', (req,res) => {
    try {
        const { emotionalState, financialThoughts } = req.body;
        const creditLimit = calculateCreditLimit(emotionalState, financialThoughts);
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