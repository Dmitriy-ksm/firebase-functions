const { admin, db } = require('./admin');
const {
    doc,
    getDocs,
    getDoc,
    query,
    where,
    limit,
    collection,
} = require('firebase/firestore');

module.exports = (req, res, next) => {
    let idToken;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else return res.status(403).json({ error: 'Unauthorized' });
    admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
            const uid = decodedToken.uid;
            req.user = decodedToken;
            return getDocs(
                query(
                    collection(db, 'users'),
                    where('userId', '==', uid),
                    limit(1)
                )
            );
        })
        .then((data) => {
            req.user.handle = data.docs[0].data().handle;
            return next();
        })
        .catch((error) => {
            console.error('Error while verifying token', error);
            return res.status(403).json(error);
        });
};
