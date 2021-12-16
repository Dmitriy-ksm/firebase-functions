let db = {
    users: [
        {
            userId: 'id',
            email: 'test@test.test',
            handle: 'user',
            createAt: '2021-12-14T11:28:09.610Z',
            imageUrl: 'path/to/image',
            bio: 'my descriptions',
            website: 'http://user.com',
            location: 'Ukraine',
        },
    ],
    screams: [
        {
            userHandle: 'user',
            body: 'this is the scream body',
            createdAt: '2021-12-14T11:28:09.610Z',
            likeCount: 5,
            commentCount: 2,
        },
    ],
};
const userDetails = {
    //Redux
    credentials: {
        userId: 'id',
        email: 'test@test.test',
        handle: 'user',
        createAt: '2021-12-14',
        imageUrl: 'path/to/image',
        bio: 'my descriptions',
        website: 'https://user.com',
        location: 'Ukraine',
    },
    likes: [
        {
            userHandle: 'user',
            screamId: 'screamId',
        },
    ],
};
