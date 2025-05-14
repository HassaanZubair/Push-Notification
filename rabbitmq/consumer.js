const amqp = require('amqplib');
const admin = require('firebase-admin');
const serviceAccount = require('../push-notification-d25c5-firebase-adminsdk-fbsvc-1fba843a95.json');

// Initialize Firebase Admin

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const QUEUE = 'notification_queue';

async function consumeQueue() {

  try {
    const connection = await amqp.connect('amqp://localhost:5672');
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE);

    console.log('Waiting for messages in queue...');

    channel.consume(QUEUE, async (msg) => {
  
      if (msg !== null) {
  
        const message = JSON.parse(msg.content.toString());
        console.log('Received message from RabbitMQ:', message);

        const firebaseMessage = {
          notification: {
            title: message.title,
            body: message.body,
  
          },
  
          token: message.token,
        };

        try {
          const response = await admin.messaging().send(firebaseMessage);
          console.log('Push sent via Firebase:', response);
  
        } 
        
        catch (err) {
          console.error('Firebase error:', err.message);
        }

        channel.ack(msg); // Acknowledge message processed
      }
    
    });
  } 
  
  catch (err) {
    console.error('Consumer error:', err.message);
  }
}

consumeQueue();