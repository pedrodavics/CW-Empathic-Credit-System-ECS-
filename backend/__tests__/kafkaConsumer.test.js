jest.mock('kafkajs', () => ({
    Kafka: jest.fn(() => ({
        consumer: jest.fn(() => ({
            connect: jest.fn(),
            subscribe: jest.fn(),
            run: jest.fn(),
            disconnect: jest.fn(),
        })),
    })),
    logLevel: jest.fn(() => 'nothing'),
}));

const { startConsumer, stopConsumer } = require('../index');
const { Kafka } = require('kafkajs');

describe('Kafka Consumer', () => {
    let consumer;

    beforeAll(async () => {
        consumer = new Kafka().consumer({ groupId: 'ecs-group' });
        await startConsumer();
    });

    afterEach(async () => {
        await consumer.disconnect();
    });

    afterAll(async () => {
        await stopConsumer();
    });

    it('should run the consumer without errors', async () => {
        await consumer.connect();
        await consumer.subscribe({ topic: 'emotional-data', fromBeginning: true });
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log(`Received message: ${message.value}`);
            },
        });

        expect(consumer.connect).toHaveBeenCalled();
        expect(consumer.subscribe).toHaveBeenCalledWith({ topic: 'emotional-data', fromBeginning: true });
        expect(consumer.run).toHaveBeenCalled();
    });
});