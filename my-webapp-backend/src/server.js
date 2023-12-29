import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import express from 'express';
import 'dotenv/config';
import { db, connectToDb } from './db.js';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const credentials = JSON.parse(
    fs.readFileSync('./credentials.json')
);

admin.initializeApp({ // tells firebase admin what credentials to use to connect to the project (checks if users are verified)
    credential: admin.credential.cert(credentials),
});

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
})

app.use(async (req, res, next) => { // gets run before the other endpoints below get called
    const { authtoken } = req.headers;

    if (authtoken) { // an authtoken will only exist if a logged in user is sending the request
        try {
            req.user = await admin.auth().verifyIdToken(authtoken);
        }

        catch (e) {
            return res.sendStatus(400); // error, might be a hacker so return immediately to block access to the other endpoints
        }
    }

    req.user = req.user || {}; // gives a default value for req.user

    next(); // allows other endpoints below to be available for use
});

// returns an array of all the articles
app.get('/api/articles', async (req, res) => {
    const { uid } = req.user;

    const articles = await db.collection('articles').find({}).toArray();

    if (articles) {
        res.json(articles);
    } 
    
    else {
        res.sendStatus(404);
    }
});

// returns the updated article info
app.get('/api/articles/:name', async (req, res) => {
    const { name } = req.params;
    const { uid } = req.user;

    const article = await db.collection('articles').findOne({ name });

    if (article) {
        const upvoteIds = article.upvoteIds || []; // set the upvoteId property to be an empty array if the property doesn't exist
        article.canUpvote = uid && !upvoteIds.includes(uid); // checks whether or not the user is able to upvote based on whether or not the user has upvoted before (i.e. whether its id is in the upvoteIds array)

        res.json(article);
    } 
    
    else {
        res.sendStatus(404);
    }
});


app.use((req, res, next) => { // this gets run before the upvote/comment endpoints get executed
    if (req.user) { // only allows the user to send requests to the upvote/comment endpoints if they are logged in
        next();
    }

    else {
        res.sendStatus(401);
    }
});


app.put('/api/articles/:name/upvote', async (req, res) => {
    const { name } = req.params;
    const { uid } = req.user;

    const article = await db.collection('articles').findOne({ name });

    if (article) {
        const upvoteIds = article.upvoteIds || []; // set the upvoteId property to be an empty array if the property doesn't exist
        const canUpvote = uid && !upvoteIds.includes(uid); // checks whether or not the user is able to upvote based on whether or not the user has upvoted before (i.e. whether its id is in the upvoteIds array)
    
        if (canUpvote) {
            await db.collection('articles').updateOne({ name }, {
                $inc: { upvotes: 1 }, // increments the upvotes field of the object whose name is equal to the name parameter by 1 IN THE ACTUAL MONGODB DATABASE
                $push: { upvoteIds: uid }, // add the uid from the list of upvoted user ids
            });
        }

        const updatedArticle = await db.collection('articles').findOne({ name });
        res.json(updatedArticle); // when a PUT request is requested, return the updated article itself to the front end
    }

    else {
        res.send('That article doesn\'t exist');
    }
});


// remove upvote endpoint
app.put('/api/articles/:name/remove-upvote', async (req, res) => {
    const { name } = req.params;
    const { uid } = req.user;

    const article = await db.collection('articles').findOne({ name });

    if (article) {
        const upvoteIds = article.upvoteIds || []; // set the upvoteId property to be an empty array if the property doesn't exist
        const canUpvote = uid && !upvoteIds.includes(uid); // checks whether or not the user is able to upvote based on whether or not the user has upvoted before (i.e. whether its id is in the upvoteIds array)
    
        if (!canUpvote) {
            await db.collection('articles').updateOne({ name }, {
                $inc: { upvotes: -1 }, // decrements the upvotes field of the object whose name is equal to the name parameter by 1 IN THE ACTUAL MONGODB DATABASE
                $pull: { upvoteIds: uid }, // remove the uid from the list of upvoted user ids
            });
        }

        const updatedArticle = await db.collection('articles').findOne({ name }); // load the updated article locally
        res.json(updatedArticle); // when a PUT request is requested, return the updated article itself to the front end
    }

    else {
        res.send('That article doesn\'t exist');
    }
});


// add new comment endpoint
app.post('/api/articles/:name/comments', async (req, res) => {
    const { name } = req.params;
    const { text } = req.body;
    const { email } = req.user;
    const article = await db.collection('articles').findOne({ name });

    if (article) {
        const commentCount = article.comments.length;

        await db.collection('articles').updateOne({ name }, {
            $push: { comments: { commentId: commentCount, postedBy: email, text } },
        });

        res.json(article);
    } else {
        res.send('That article doesn\'t exist!');
    }
});


// delete comment endpoint
app.delete('/api/articles/:name/comments/:commentId', async (req, res) => {
    const { name, commentId } = req.params;
    const { email } = req.user;

    const article = await db.collection('articles').findOne({ name });

    if (article) {
        var comments_arr = article.comments; 
        comments_arr.splice(commentId, 1);

        await db.collection('articles').updateOne({ name }, { 
            $set: { comments :  comments_arr}, 
        
        });

        res.json(article);
    } else {
        res.send('That article doesn\'t exist!');
    }
});


const PORT = process.env.PORT || 3000;

connectToDb(() => {
    console.log('Successfully connected to database!');
    app.listen(PORT, () => {
        console.log('Server is listening on port ' + PORT);
    });
})


// import express from 'express';
// import { MongoClient } from 'mongodb';
// import { db, connectToDb } from './db.js';

// // temporary database
// // let articlesInfo = [{
// //     name: 'learn-react',
// //     upvotes: 0,
// //     comments: [],
// // }, {
// //     name: 'learn-node',
// //     upvotes: 0,
// //     comments: [],
// // }, {
// //     name: 'mongodb',
// //     upvotes: 0,
// //     comments: [],
// // }]

// const app = express();
// app.use(express.json()); /* takes json data that is defined as the request body on postman and makes it available for the endpoint to reference */

// /* initial examples of just beginning to work with express */
// // app.post('/hello', (req, res) => { /* res stands for result */
// //     console.log(req.body); /* req.body returns the json object as permitted on app.use(express.json()); */
// //     res.send(`hello ${req.body.name}!`);
// // });

// // app.get('/hello/:name', (req, res) => { /* parameter names for routes begin w/ a : (e.g. name is a parameter for this route) */
// //     const name = req.params.name; /* req.params returns an object containing of the url parameters in '/hello/:name' and their values (e.g. in this example, when on localhost:8000/skylar,, req.params = { name: 'skylar' }) */
// //     res.send(`hello ${name}!`) /* when on localhost:8000/skylar, the endpoint returns "hello skylar!" (MAKE SURE TO USE BACKTICKS AROUND THE STR OR ELSE THE ${name} WILL NOT BE EXTRACTED) */
// // });


// // GETTING THE APPROPRIATE ARTICLE USING THE URL LINK ENDPOINT
// app.get('/api/articles/:name', async(req, res) => {
//     const { name } = req.params;

//     const client = new MongoClient('mongodb://127.0.0.1:27017'); // fetches the mongodb client using the url of the mongodb database
//     await client.connect(); // asynchronous code (pauses until promise condition is approved)

//     const db = client.db('react-blog-db'); // references actual database on mongodb for the webapp

//     const article = await db.collection('articles').findOne({ name }); // isolates the article that matches the name parameter using the mongodb query syntax

//     if (article) {
//         res.json(article); // use res.json to return a json obj
//     }

//     else {
//         res.sendStatus(404); // return a 404 error if article is not found
//     }

// });


// // UPVOTE ENDPOINT FEATURE
// app.put('/api/articles/:name/upvote', async(req, res) => { // updates the upvotes property of the associated article (PUT req)
//     const { name } = req.params; // equivalent of const name = req.params.name;

//     const client = new MongoClient('mongodb://127.0.0.1:27017');
//     await client.connect();

//     const db = client.db('react-blog-db');
//     await db.collection('articles').updateOne({ name }, {
//         $inc: { upvotes: 1}, // increments the upvotes field of the object whose name is equal to the name parameter by 1 IN THE ACTUAL MONGODB DATABASE
//         // $set: { upvotes: 100 }, // sets the upvotes field to 100 (not using)
//     });

//     const article = await db.collection('articles').findOne({ name }); // load the updated article locally
//     if (article) { // checks if the article actually exists
//         res.send(`The ${name} article now has ${article.upvotes} upvotes :D`); // wrap variables in $() to transform its value into a string
//     }

//     else {
//         res.send('That article doesn\'t exist'); // use a backslash to parse the ' in doesn't
//     }

//     // CODE BELOW IS OBSOLETE (REFERENCES OLD TEMPORARY ARRAY)
//     // const article = articlesInfo.find(a => a.name === name); // find the relevant article in the articlesInfo database using the name parameter (references to old temp database)
//     // if (article) { // checks if the article actually exists
//     //     article.upvotes += 1;
//     //     res.send(`The ${name} article now has ${article.upvotes} upvotes :D`); // wrap variables in $() to transform its value into a string
//     // }

//     // else {
//     //     res.send('That article doesn\'t exist'); // use a backslash to parse the ' in doesn't
//     // }

// });


// // COMMENT ENDPOINT FEATURE
// app.post('/api/articles/:name/comments', async(req, res) => {
//     const { name } = req.params;
//     const { postedBy, text } = req.body; // fetches the postedBy and text values from the body object that came with the request

//     const client = new MongoClient('mongodb://127.0.0.1:27017');
//     await client.connect();

//     const db = client.db('react-blog-db');
//     await db.collection('articles').updateOne({ name }, {
//         $push: { comments: { postedBy, text } }, // adds a new object to the comments array in the database
//     });
//     const article = await db.collection('articles').findOne({ name }); // load the updated article locally

//     if (article) {
//         res.send(article.comments);
//     }

//     else {
//         res.send('That article doesn\'t exist'); 
//     }

//     // CODE BELOW IS OBSOLETE (REFERENCES OLD TEMPORARY ARRAY)
//     // const article = articlesInfo.find(a => a.name === name); // references to old temp database 
//     // if (article) {
//     //     article.comments.push({ postedBy, text }); // adds a new object to the comments array in the database
//     //     res.send(article.comments);
//     // }

//     // else {
//     //     res.send('That article doesn\'t exist'); 
//     // }

// });

// app.listen(3000, () => {
//     console.log('Server is listening on port 3000');
// });

// // connectToDb(() => {
// //     console.log('Successfully connected to database!');
// //     app.listen(8000, () => {
// //         console.log('Server is listening on port 8000');
// //     });
// // })