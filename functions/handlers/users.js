const { db, admin } = require('../util/admin');
const config = require('../util/config');
const { doc, getDoc, setDoc, updateDoc } = require('firebase/firestore');
const {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} = require('firebase/auth');

const { validateSignupData, validateLoginData } = require('../util/validator');
const { object } = require('firebase-functions/v1/storage');

const auth = getAuth();

exports.signup = (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    const { errors, valid } = validateSignupData(newUser);

    if (!valid) return res.status(400).json(errors);

    const noImg = 'no-img.png';

    let token, userId;
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
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
                userId,
            };
            return setDoc(doc(db, 'users', newUser.handle), userCredentials);
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
};

exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password,
    };

    const { errors, valid } = validateLoginData(user);

    if (!valid) return res.status(400).json(errors);

    signInWithEmailAndPassword(auth, user.email, user.password)
        .then((data) => {
            return data.user.getIdToken();
        })
        .then((token) => {
            return res.json({ token });
        })
        .catch((err) => {
            console.error(err);
            if (err.code === 'auth/wrong-password') {
                return res.status(403).json({ general: 'Wrong password' });
            } else return res.status(500).json({ error: err.code });
        });
};

exports.uploadImage = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new BusBoy({ headers: req.headers });
    let imageFileName;
    let imageToBeUpload = {};

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png')
            return res.status(400).json({ error: 'Wrong file type submitted' });
        const fileNameSplitted = filename.split('.');
        const imageExtension = fileNameSplitted[fileNameSplitted.length - 1];
        imageFileName = `${Math.round(
            Math.random() * 10000000000
        )}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToBeUpload = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));
    });
    busboy.on('finish', () => {
        admin
            .storage()
            .bucket()
            .upload(imageToBeUpload.filepath, {
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: imageToBeUpload.mimetype,
                    },
                },
            })
            .then(() => {
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
                return updateDoc(doc(db, 'users', req.user.handle), {
                    imageUrl,
                });
            })
            .then(() => res.json({ message: 'Image upload successfully' }))
            .catch((err) => {
                console.error(err);
                return res.status(500).json({ error: err.code });
            });
    });
    busboy.end(req.rawBody);
};
