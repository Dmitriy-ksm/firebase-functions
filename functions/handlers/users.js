const { db } = require('../util/admin');
const { doc, getDoc, setDoc } = require('firebase/firestore');
const {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} = require('firebase/auth');

const { validateSignupData, validateLoginData } = require('../util/validator');

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
