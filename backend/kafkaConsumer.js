const { Kafka } = require('kafkajs');

// Kafka instance configuration
const kafka = new Kafka({
    clientID: 'empathic-credit-system',
    brokers: ['localhost:9092']
});

// Consumer configuration
const consumer = kafka.consumer({ groupID: 'emotion-data-group' });

// Function to run the Kafka consumer
const run = async () => {
    try {
        await consumer.connect();
        await consumer.subscribe({ topic: 'emotion-data', fromBeginning: true });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const emotionData = JSON.parse(message.value.toString());
                console.log('Received emotion data', emotionData);
            }
        });
    } catch (err) {
        console.error('Error in Kafka consumer:', err);
    }
};

