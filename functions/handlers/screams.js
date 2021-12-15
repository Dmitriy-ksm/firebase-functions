const { db } = require('../util/admin');
const {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
} = require('firebase/firestore');

exports.getAllScreams = (request, response) => {
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
};

exports.postOneScream = (request, response) => {
    const newScream = {
        body: request.body.body,
        userHandle: request.user.handle,
        createdAt: new Date().toISOString(), //admin.firestore.Timestamp.fromDate(new Date())
    };
    console.log(newScream);
    var screams = collection(db, 'screams');

    setDoc(doc(screams), newScream)
        .then(() => {
            response.json({
                message: `document created successfully`,
            });
        })
        .catch((err) => {
            response.status(500).json({ error: `something went wrong` });
            console.error(err);
        });
};
