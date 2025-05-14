const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const { Client } = require('pg');

const deviceRoutes = require('./routes/devices');
const userRoutes = require('./routes/users');
const linkRoutes = require('./routes/userDevices');
const settingsRoutes = require('./routes/settings');
const notificationRoutes = require('./routes/sendNotification');

const app = express();
const port = 3000;

// Middlewares
app.use(cors({ origin: 'http://127.0.0.1:5500' }));
app.use(bodyParser.json());

// Firebase Admin
const serviceAccount = require('./push-notification-d25c5-firebase-adminsdk-fbsvc-1fba843a95.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

// Database connection
const dbClient = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'pushdb',
  password: 'password',
  port: 5433,
});
dbClient.connect();
app.locals.db = dbClient;

// Routes
app.use('/devices', deviceRoutes);
app.use('/users', userRoutes);
app.use('/user-devices', linkRoutes);
app.use('/settings', settingsRoutes);
app.use('/send-notification', notificationRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
