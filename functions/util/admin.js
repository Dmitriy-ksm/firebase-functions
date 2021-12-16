const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const {
    getFirestore,
    connectFirestoreEmulator,
} = require('firebase/firestore');
const { getAuth, connectAuthEmulator } = require('firebase/auth');
const config = require('./config');

const firebaseApp = initializeApp(config);
admin.initializeApp();
//const db = getFirestore(firebaseApp);
const db = getFirestore();
//connectFirestoreEmulator(db, '127.0.0.1', 8080);

const auth = getAuth();
//connectAuthEmulator(auth, 'http://localhost:9099');

module.exports = { admin, db, auth };
