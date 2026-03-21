const { Partitioners } = require("kafkajs");
const kafka = require("../config/kafka");
const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner
});

async function connectProducer() {
    await producer.connect();
    console.log("✅ Kafka Producer connected");
}

async function sendNotificationEvent(data) {
    try {
        await producer.send({
            topic: "notifications",
            messages: [{
                value: JSON.stringify(data)
            }]
        });
    } catch (error) {
        console.error("Failed to send Kafka event:", error);
    }
}

module.exports = {
    connectProducer,
    sendNotificationEvent
}