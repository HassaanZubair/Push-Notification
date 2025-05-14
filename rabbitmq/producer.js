const amqp = require('amqplib');

// This function decides if the device is online

function isDeviceOnline(token) {
  // Pretend device is OFFLINE for testing
  // Change to true to test ONLINE
  return false; // change this to true when testing online
}

async function sendToQueue(message) {
  
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect('amqp://localhost:5672');
    const channel = await connection.createChannel();

    // Check device status
    const online = isDeviceOnline(message.token);

    // Pick the correct queue
    const queue = online ? 'notification_queue' : 'offline_queue';

    // Make sure the queue exists
    await channel.assertQueue(queue, { durable: true });

    // Send message to the selected queue
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    console.log(`Sent to ${queue}:`, message);

    // Close RabbitMQ connection
    await channel.close();
    await connection.close();
  } catch (err) {
    console.error('Failed to send to RabbitMQ:', err.message);
  }
}

module.exports = sendToQueue;