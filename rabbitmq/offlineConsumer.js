const amqp = require('amqplib');
const admin = require('firebase-admin');
const serviceAccount = require('../push-notification-d25c5-firebase-adminsdk-fbsvc-1fba843a95.json');

// Firebase init
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const QUEUE = 'offline_queue';

async function consumeOfflineQueue() {

  try {

    const connection = await amqp.connect('amqp://localhost:5672');
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE);

    console.log('Waiting for messages in offline queue...');

    channel.consume(QUEUE, async (msg) => {
   
      if (msg !== null) {
        
        const message = JSON.parse(msg.content.toString());
        console.log('Received from offline queue:', message);

        //  Check if device is now online or offline 
        const isOnline = await checkIfDeviceOnline(message.token);

        if (isOnline) {
         
          //Send push
          const firebaseMessage = {
            notification: {
              title: message.title,
              body: message.body,
            },
         
            token: message.token,
          };

          try {
         
            const response = await admin.messaging().send(firebaseMessage);
            console.log('📲 Push sent from offline queue:', response);
            channel.ack(msg); // Remove message from queue
          }
          
          catch (err) {
            console.error('Firebase error:', err.message);
          }
        } 
        
        else {
          console.log('Device still offline, try later...');
        }
      }
    });

  } 
  
  catch (err) {
    console.error('Offline consumer error:', err.message);
  }
}

// Fake function, always returns true for now
async function checkIfDeviceOnline(token) {
  return true; 
}

consumeOfflineQueue();