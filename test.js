const sendToQueue = require('./rabbitmq/producer');

sendToQueue({
  title: 'Test Push',
  body: 'This is a test message',
  token: 'YOUR_FIREBASE_TOKEN_HERE' // just for testing, replace with actual token
});
