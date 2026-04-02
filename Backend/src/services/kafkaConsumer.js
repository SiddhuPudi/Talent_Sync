const kafka = require("../config/kafka");
const notificationService = require("./notificationService");
let consumer = null;
if (kafka) {
    consumer = kafka.consumer({ groupId: "notification-group" });
}
async function startConsumer() {
    if (!consumer) {
        console.log("⚠️ Kafka Consumer skipped (Kafka disabled)");
        return;
    }
    await consumer.connect();
    await consumer.subscribe({ topic: "notifications", fromBeginning: true });
    console.log("✅ Kafka Consumer running");
    await consumer.run({
        eachMessage: async ({ message }) => {
            try {
                const data = JSON.parse(message.value.toString());
                console.log("Kafka Event Received:", data);
                await notificationService.createNotification(
                    data.userId,
                    data.type,
                    data.message
                );
            } catch (error) {
                console.error("Error processing Kafka message:", error);
            }
        }
    });
}

module.exports = {
    startConsumer
};