const { Kafka } = require("kafkajs");
const kafka = new Kafka({
    clientId: "talent-sync",
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"]
});
module.exports = kafka;