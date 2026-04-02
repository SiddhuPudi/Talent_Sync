let kafka = null;
if (process.env.KAFKA_BROKER) {
    const { Kafka } = require("kafkajs");
    kafka = new Kafka({
        clientId: "talent-sync",
        brokers: [process.env.KAFKA_BROKER || "localhost:9092"]
    });
    console.log("✅ kafka Connected.");
} else {
    console.log("⚠️ KAFKA Disabled (No KAFKA_BROKER)");
}
module.exports = kafka;