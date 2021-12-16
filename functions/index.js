const functions = require('firebase-functions');
const app = require('express')();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

const { getAllScreams, postOneScream } = require('./handlers/screams');
const {
    signup,
    login,
    uploadImage,
    addUserDetails,
    getUser,
} = require('./handlers/users');
const FBAuth = require('./util/FBAuth');

//const firebase = require('firebase');
//const firebaseApp = initializeApp(firebaseConfig);

//Users routes
app.post('/signup', signup);

app.post('/login', login);

app.post('/user/image', FBAuth, uploadImage);

app.post('/user', FBAuth, addUserDetails);

app.get('/user', FBAuth, getUser);

//Scream routes
app.get('/scream', getAllScreams);

app.post('/scream', FBAuth, postOneScream);

exports.api = functions.https.onRequest(app);
