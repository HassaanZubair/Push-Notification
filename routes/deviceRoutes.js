const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const { Client } = require('pg'); // PostgreSQL Client

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
  password: 'password', 
  port: 5433,
});
dbClient.connect();

// Save token to PostgreSQL
app.post('/devices', async (req, res) => {
 
  const { token, type, userEmail, firebaseSettings } = req.body;

  if (!token || !userEmail) return res.status(400).json({ message: 'Token and userEmail are required' });

  try {
   
    const deviceResult = await dbClient.query(
      'INSERT INTO devices (token, type) VALUES ($1, $2) ON CONFLICT (token) DO NOTHING RETURNING id',
      [token, type || 'web']
   
    );
    const deviceId = deviceResult.rows[0]?.id;

    if (!deviceId) {
      return res.status(400).json({ message: 'Device already exists or there was an issue saving the device' });
    }

    const userResult = await dbClient.query(
      'INSERT INTO users (email) VALUES ($1) ON CONFLICT (email) DO NOTHING RETURNING id',
      [userEmail]
   
    );
   
    const userId = userResult.rows[0]?.id;

    if (!userId) {
      return res.status(400).json({ message: 'User could not be created' });
    }

    await dbClient.query(
      'INSERT INTO user_devices (user_id, device_id) VALUES ($1, $2) ON CONFLICT (user_id, device_id) DO NOTHING',
      [userId, deviceId]
    );

    if (firebaseSettings) {
   
      await dbClient.query(
        'INSERT INTO settings (firebase_project_id, firebase_private_key, firebase_client_email) VALUES ($1, $2, $3) ON CONFLICT (firebase_project_id) DO NOTHING',
        [firebaseSettings.projectId, firebaseSettings.privateKey, firebaseSettings.clientEmail]
      );
    }

    res.status(201).json({ message: 'Token saved and related data created successfully' });

  } 
  
  catch (err) {
    console.error('Error saving token and related data:', err);
    res.status(500).json({ message: 'Error saving token and related data' });
  }
});

// Endpoint to send push notifications
app.post('/send-notification', (req, res) => {
  const { token, title, body } = req.body;

  if (!token || !title || !body) {
  
    return res.status(400).json({ message: 'Token, title, and body are required!' });
  }

  const message = {
    notification: { title, body },
    token,
  };

  admin.messaging().send(message)
    .then((response) => {
      console.log('Successfully sent message:', response);
      res.status(200).json({ message: 'Notification sent successfully!' });
    })
  
    .catch((error) => {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Failed to send notification', error: error.message });
    });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});