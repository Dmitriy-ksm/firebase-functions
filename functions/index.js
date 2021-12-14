const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// const config = functions.config();
// console.log(config);
// const APIKEY = config.api.key;

const firebaseConfig = {
    apiKey: 'AIzaSyAhEAa9a8p4FO4aKCEVeVFBtZja6WMWMeY',
    authDomain: 'fir-demo-project-6611e.firebaseapp.com',
    projectId: 'fir-demo-project-6611e',
    storageBucket: 'fir-demo-project-6611e.appspot.com',
    messagingSenderId: '887929297357',
    appId: '1:887929297357:web:7f8efbd1cec0cbad120c84',
    measurementId: 'G-HB1V1NNFS7',
};

const { initializeApp } = require('firebase/app');
const {
    getFirestore,
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
} = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { database } = require('firebase-admin');
const e = require('express');
//const firebase = require('firebase');
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(firebaseApp);
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

app.get('/scream', (request, response) => {
    var screams = collection(db, 'screams');

    getDocs(screams)
        .then((data) => {
            let screams = [];
            data.forEach((doc) => {
                screams.push({
                    screamId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt,
                });
            });
            return response.json(screams);
        })
        .catch((err) => console.error(err));
});

app.post('/scream', (request, response) => {
    const newScream = {
        body: request.body.body,
        userHandle: request.body.userHandle,
        createdAt: new Date().toISOString(), //admin.firestore.Timestamp.fromDate(new Date())
    };

    var screams = collection(db, 'screams');

    setDoc(doc(screams), newScream)
        .then((doc) => {
            response.json({
                message: `document ${doc.id} created successfully`,
            });
        })
        .catch((err) => {
            response.status(500).json({ error: `something went wrong` });
            console.error(err);
        });
});

// exports.getScreams = functions.https.onRequest((request, response) => {
//     admin.firestore().collection('screams').get()
//     .then(data =>{
//         let screams = [];
//         data.forEach(doc =>{
//             screams.push(doc.data());
//         });
//         return response.json(screams);
//     })
//     .catch(err => console.error(err));
// });

// exports.createScream = functions.https.onRequest((request, response) => {
//     if(request.method !== 'POST'){
//         return response.status(400).json({ error: "Method not allowed" });
//     }

//     const newScream = {
//         body: request.body.body,
//         userHandle: request.body.userHandle,
//         createAt: admin.firestore.Timestamp.fromDate(new Date())
//     };

//     admin.firestore()
//         .collection('screams')
//         .add(newScream)
//         .then(doc => {
//             response.json({message: `document ${doc.id} created successfully`});
//         })
//         .catch(err=>{
//             response.status(500).json({error:`something went wrong`});
//             console.error(err);
//         })
// });

app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };
    let token;
    let userId;
    const user = doc(db, 'users', `${newUser.handle}`);
    getDoc(user)
        .then((doc) => {
            if (doc.exists()) {
                return res
                    .status(400)
                    .json({ handle: 'this handle is already taken' });
            } else {
                return createUserWithEmailAndPassword(
                    auth,
                    newUser.email,
                    newUser.password
                );
            }
        })
        .then((userCredential) => {
            const user = userCredential.user;
            userId = user.uid;
            return userCredential.user.getIdToken();
        })
        .then((_token) => {
            token = _token;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId,
            };
            return setDoc(doc(db, 'users', newUser.handle), userCredentials);
            //return res.status(201).json({ token });
        })
        .then(() => {
            return res.status(201).json({ token });
        })
        .catch((err) => {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                return res
                    .status(400)
                    .json({ email: 'Email is already in use' });
            } else {
                return res.status(500).json({ error: err.code });
            }
        });
});

exports.api = functions.https.onRequest(app);
