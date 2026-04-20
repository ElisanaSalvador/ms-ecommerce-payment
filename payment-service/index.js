require("dotenv").config();
const express = require("express");
const amqp = require("amqplib");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/payments"
});

let channel;

async function connectRabbit(retries = 10, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await amqp.connect(
        process.env.RABBITMQ_URL || "amqp://localhost"
      );
      channel = await conn.createChannel();
      await channel.assertQueue("notifications");
      console.log("✅ Connected to RabbitMQ");
      return;
    } catch (error) {
      console.log(`⏳ Waiting for RabbitMQ... (attempt ${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Could not connect to RabbitMQ after multiple retries");
}

app.post("/payment", async (req, res) => {
  const { userId, amount } = req.body;

  const result = await pool.query(
    "INSERT INTO transactions(user_id, amount, status) VALUES($1,$2,$3) RETURNING *",
    [userId, amount, "PENDING"]
  );

  const transaction = result.rows[0];

  channel.sendToQueue(
    "notifications",
    Buffer.from(
      JSON.stringify({
        type: "PAYMENT_CREATED",
        transaction
      })
    )
  );

  res.json(transaction);
});

app.put("/payment/:id/confirm", async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    "UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *",
    ["SUCCESS", id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  const transaction = result.rows[0];

  channel.sendToQueue(
    "notifications",
    Buffer.from(
      JSON.stringify({
        type: "PAYMENT_CONFIRMED",
        transaction
      })
    )
  );

  res.json(transaction);
});

app.listen(3000, async () => {
  await connectRabbit();
  console.log("Payment service running on port 3000");
});