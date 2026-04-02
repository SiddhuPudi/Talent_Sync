const { Partitioners } = require("kafkajs");
const kafka = require("../config/kafka");
let producer = null;
if (kafka) {
    producer = kafka.producer({
        createPartitioner: Partitioners.LegacyPartitioner
    });
}
async function connectProducer() {
    if (!producer) {
        console.log("⚠️ Kafka Producer skipped (Kafka disabled)");
        return;
    }
    await producer.connect();
    console.log("✅ Kafka Producer connected");
}
async function sendNotificationEvent(data) {
    if (!producer) {
        console.log("⚠️ Kafka event skipped:", data);
        return;
    }
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
};