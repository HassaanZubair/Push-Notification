const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const sendToQueue = require('./rabbitmq/producer');


const { Client } = require('pg'); 

const app = express();
const port = 3000;

// Enable CORS for your frontend
app.use(cors({
  origin: 'http://127.0.0.1:5500' // Adjust the URL for frontend
}));

// Body parser middleware to parse JSON requests
app.use(bodyParser.json());

// Firebase Admin SDK setup
const serviceAccount = require('./push-notification-d25c5-firebase-adminsdk-fbsvc-1fba843a95.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// PostgreSQL setup
const dbClient = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'pushdb',
  password: 'password', // Ensure this is the correct password
  port: 5433,
});

dbClient.connect();

// Save token to PostgreSQL

app.post('/devices', async (req, res) => {
  const { token, type } = req.body;

  if (!token) return res.status(400).json({ message: 'Token is required' });

  try {

    const result = await dbClient.query(
      'INSERT INTO devices (token, type) VALUES ($1, $2) ON CONFLICT (token) DO NOTHING RETURNING *',
      [token, type || 'web']
    );

    res.status(201).json({ message: 'Token saved', data: result.rows[0] || {} });
  } 
  
  catch (err) {
    console.error('Error saving token:', err);
    res.status(500).json({ message: 'Error saving token' });
  }
});

// Save user to PostgreSQL

app.post('/users', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });

  try {

    const result = await dbClient.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );

    res.status(201).json({ message: 'User created', data: result.rows[0] });
  } 
  
  catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Error creating user' });
  }
});

//Link user to device in PostgreSQL

app.post('/user-devices', async (req, res) => {
  const { user_id, device_id } = req.body;

  if (!user_id || !device_id) return res.status(400).json({ message: 'User ID and Device ID are required' });

  try {

    const result = await dbClient.query(
      'INSERT INTO user_devices (user_id, device_id) VALUES ($1, $2) RETURNING *',
      [user_id, device_id]
    );

    res.status(201).json({ message: 'User linked to device', data: result.rows[0] });

  } 
  
  catch (err) {
    console.error('Error linking user to device:', err);
    res.status(500).json({ message: 'Error linking user to device' });
  }
});

// Save Firebase settings to PostgreSQL

app.post('/settings', async (req, res) => {
  const { firebase_project_id, firebase_private_key, firebase_client_email } = req.body;

  if (!firebase_project_id || !firebase_private_key || !firebase_client_email) {
    return res.status(400).json({ message: 'All Firebase settings are required' });
  }

  try {

    const result = await dbClient.query(
      'INSERT INTO settings (firebase_project_id, firebase_private_key, firebase_client_email) VALUES ($1, $2, $3) RETURNING *',
      [firebase_project_id, firebase_private_key, firebase_client_email]
    );

    res.status(201).json({ message: 'Settings saved', data: result.rows[0] });
  } 
  
  catch (err) {
    console.error('Error saving settings:', err);
    res.status(500).json({ message: 'Error saving settings' });
  }
});


// before applying offline function
// Endpoint to send push notifications directly to firebase

// app.post('/send-notification', (req, res) => {
//   const { token, title, body } = req.body;

//   if (!token || !title || !body) {
//     return res.status(400).json({ message: 'Token, title, and body are required!' });
//   }

//   const message = {
//     notification: { title, body },
//     token,
//   };

//   admin.messaging().send(message)
//     .then((response) => {
//       console.log('Successfully sent message:', response);
//       res.status(200).json({ message: 'Notification sent successfully!' });
//     })
//     .catch((error) => {
//       console.error('Error sending message:', error);
//       res.status(500).json({ message: 'Failed to send notification', error: error.message });
//     });
// });

// Endpoint to send push notifications via RabbitMQ to firebase

app.post('/send-notification', async (req, res) => {
  const { token, title, body } = req.body;

  // Check if all data is sent
  if (!token || !title || !body) {
    return res.status(400).json({ message: 'Token, title, and body are required!' });
  }

  // Create a message object to send to RabbitMQ
  const message = {
    token,
    title,
    body,
  };

  // Send the message to the RabbitMQ queue
  await sendToQueue(message);

  // Respond to frontend that it's added to queue
  res.status(200).json({ message: ' Notification queued in RabbitMQ will pass later!' });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});