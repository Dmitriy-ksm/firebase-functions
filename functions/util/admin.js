const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const config = require('./config');

const firebaseApp = initializeApp(config);
admin.initializeApp();
const db = getFirestore(firebaseApp);

module.exports = { admin, db };
