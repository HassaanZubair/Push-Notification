
importScripts('https://www.gstatic.com/firebasejs/9.0.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.2/firebase-messaging-compat.js');

// ✅ Initialize Firebase inside service worker
const firebaseConfig = {
  apiKey: "AIzaSyARqlr1seX_FbF_Kxm6byPHpVkI1dSVzQ0",
  authDomain: "push-notification-d25c5.firebaseapp.com",
  projectId: "push-notification-d25c5",
  storageBucket: "push-notification-d25c5.firebasestorage.app",
  messagingSenderId: "179985074851",
  appId: "1:179985074851:web:df53504a25c55f85f58d16",
  measurementId: "G-DEYNL3WR8Y"
};

firebase.initializeApp(firebaseConfig);

//  Get messaging current
const messaging = firebase.messaging();

// Handle background push messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification.title || 'Background Notification';
  const notificationOptions = {
    body: payload.notification.body || 'You have a new message!',
    icon: '/firebase-logo.png' // optional
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
