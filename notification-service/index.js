require("dotenv").config();
const amqp = require("amqplib");

async function start(retries = 10, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost");
      const channel = await conn.createChannel();
      await channel.assertQueue("notifications");
      console.log("✅ Notification service connected to RabbitMQ");

      channel.consume("notifications", (msg) => {
        const data = JSON.parse(msg.content.toString());

        if (data.type === "PAYMENT_CREATED") {
          console.log("📱 Pagamento recebido:", data.transaction);
        }

        if (data.type === "PAYMENT_CONFIRMED") {
          console.log("✅ Pagamento confirmado:", data.transaction);
        }

        channel.ack(msg);
      });
      return;
    } catch (error) {
      console.log(`⏳ Waiting for RabbitMQ... (attempt ${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Could not connect to RabbitMQ after multiple retries");
}

start();