const { Kafka } = require("kafkajs");
const kafka = new Kafka({
    clientId: "talent-sync",
    brokers: ["localhost:9092"]
});
module.exports = kafka;