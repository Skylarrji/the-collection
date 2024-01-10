import fs from 'fs';
import path from 'path';
import axios from 'axios';
import querystring from 'querystring';
import admin from 'firebase-admin';
import express from 'express';
import 'dotenv/config';
import { db, connectToDb } from './db.js';
import { ObjectId } from 'mongodb';

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
app.use(express.json()); // takes json data that is defined as the request body on postman and makes it available for the endpoint to reference 
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

// returns an array of all the articles in the database
app.get('/api/articles', async (req, res) => {
    const { uid } = req.user;

    const articles = await db.collection('articles').find({}).toArray(); // asynchronous code (pauses until promise condition is approved)

    if (articles) {
        res.json(articles);
    } 
    
    else {
        res.sendStatus(404);
    }
});

// GETTING THE APPROPRIATE ARTICLE USING THE URL LINK ENDPOINT
// returns the updated article info
app.get('/api/articles/:articleId', async (req, res) => {
    const { articleId } = req.params;
    const { uid } = req.user;

    const article = await db.collection('articles').findOne({ _id: new ObjectId(articleId) }); // isolates the article that matches the articleId parameter using the mongodb query syntax

    if (article) {
        const upvoteIds = article.upvoteIds || []; // set the upvoteId property to be an empty array if the property doesn't exist
        article.canUpvote = uid && !upvoteIds.includes(uid); // checks whether or not the user is able to upvote based on whether or not the user has upvoted before (i.e. whether its id is in the upvoteIds array)

        res.json(article); // use res.json to return a json obj
    } 
    
    else {
        res.sendStatus(404); // return a 404 error if article is not found
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

// update upvote endpoint
app.put('/api/articles/:articleId/upvote', async (req, res) => { // updates the upvotes property of the associated article (PUT req)
    const { articleId } = req.params; // equivalent of const articleId = req.params.articleId;
    const { uid } = req.user; 

    const article = await db.collection('articles').findOne({ _id: new ObjectId(articleId) });

    if (article) { // found the article
        const upvoteIds = article.upvoteIds || []; // set the upvoteId property to be an empty array if the property doesn't exist
        const canUpvote = uid && !upvoteIds.includes(uid); // checks whether or not the user is able to upvote based on whether or not the user has upvoted before (i.e. whether its id is in the upvoteIds array)
    
        if (canUpvote) {
            await db.collection('articles').updateOne({ _id: new ObjectId(articleId) }, {
                $inc: { upvotes: 1 }, // increments the upvotes field of the object whose name is equal to the name parameter by 1 IN THE ACTUAL MONGODB DATABASE
                $push: { upvoteIds: uid }, // add the uid from the list of upvoted user ids
            });
        }

        const updatedArticle = await db.collection('articles').findOne({ _id: new ObjectId(articleId) });
        res.json(updatedArticle); // when a PUT request is requested, return the updated article itself to the front end
    }

    else {
        res.send('That article doesn\'t exist');
    }
});


// remove upvote endpoint
app.put('/api/articles/:articleId/remove-upvote', async (req, res) => {
    const { articleId } = req.params;
    const { uid } = req.user;

    const article = await db.collection('articles').findOne({ _id: new ObjectId(articleId) });

    if (article) {
        const upvoteIds = article.upvoteIds || []; // set the upvoteId property to be an empty array if the property doesn't exist
        const canUpvote = uid && !upvoteIds.includes(uid); // checks whether or not the user is able to upvote based on whether or not the user has upvoted before (i.e. whether its id is in the upvoteIds array)
    
        if (!canUpvote) {
            await db.collection('articles').updateOne({ _id: new ObjectId(articleId) }, {
                $inc: { upvotes: -1 }, // decrements the upvotes field of the object whose name is equal to the name parameter by 1 IN THE ACTUAL MONGODB DATABASE
                $pull: { upvoteIds: uid }, // remove the uid from the list of upvoted user ids
            });
        }

        const updatedArticle = await db.collection('articles').findOne({ _id: new ObjectId(articleId) }); // load the updated article locally
        res.json(updatedArticle); // when a PUT request is requested, return the updated article itself to the front end
    }

    else {
        res.send('That article doesn\'t exist');
    }
});


// add new comment endpoint
app.post('/api/articles/:articleId/comments', async (req, res) => {
    const { articleId } = req.params;
    const { text } = req.body; // fetches th text values from the body object that came with the request
    const { email } = req.user;
    const article = await db.collection('articles').findOne({ _id: new ObjectId(articleId) }); 

    if (article) {
        const commentCount = article.comments.length;

        await db.collection('articles').updateOne({ _id: new ObjectId(articleId) }, {
            $push: { comments: { commentId: commentCount, postedBy: email, text } }, // adds a new object to the comments array in the database
        });
        res.json(article);
    } 
    
    else {
        res.send('That article doesn\'t exist!');
    }
});


// add new article endpoint
app.post('/api/add-article', async (req, res) => {
    const { name, upvotes, comments, upvoteIds, content, title, tags } = req.body;
    const { email } = req.user;
    await db.collection('articles').insertOne( {
        postedBy: email,
        name: name,
        upvotes: upvotes,
        comments: comments,
        upvoteIds: upvoteIds,
        content: content,
        title: title,
        tags: tags
    } );
    res.json("article succesfully added");
});


// add article tags endpoint
app.post('/api/get-article-tags', async (req, res) => {
    const { text } = req.body;

    const formData = querystring.stringify({
        text: text,
        extractors: 'topics'
    });

    const response = await axios.post('https://api.textrazor.com/',
        formData,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-TextRazor-Key': 'e442cf0026efb56b314e0cfa5debe03207d649bb0456097a331dfd8f', // Replace with your actual API key
            }
        }
      );
    
    const topics = response.data.response.topics;
    if (topics !== undefined) {
        const tags = topics.slice(0, 3).map(topic => topic.label); // extracts top 3 topics associated w the article
        res.json(tags);
    }

    else {
        const tags = [];
        res.json(tags);
    }
});


// edit an existing article endpoint
app.put('/api/edit-article/:articleId', async (req, res) => {
    const { email } = req.user;
    const { content, title, tags } = req.body;
    const { articleId } = req.params;
    const article = await db.collection('articles').findOne({ _id: new ObjectId(articleId) });

    if (article.postedBy === email) { // can only edit if the user is the owner of the article
        await db.collection('articles').updateOne({ _id: new ObjectId(articleId) }, {
            $set: { content: content, title: title, tags: tags  },
        });

        res.json("article successfully modified");
    }

    else {
        res.json("cannot edit the article");
    }
});

// delete comment endpoint
app.delete('/api/articles/:articleId/comments/:commentId', async (req, res) => {
    const { articleId, commentId } = req.params;
    const { email } = req.user;

    const article = await db.collection('articles').findOne({ _id: new ObjectId(articleId) });

    if (article) {
        var comments_arr = article.comments; 
        comments_arr.splice(commentId, 1);

        await db.collection('articles').updateOne({ _id: new ObjectId(articleId) }, { 
            $set: { comments :  comments_arr}, 
        
        });

        res.json(article);
    } 
    
    else {
        res.send('That article doesn\'t exist!');
    }
});

// delete article endpoint
app.delete('/api/articles/:articleId', async (req, res) => {
    const { articleId } = req.params;

    const article = await db.collection('articles').findOne({ _id: new ObjectId(articleId) });

    if (article) {
        await db.collection('articles').deleteOne({ _id: new ObjectId(articleId) });
        res.json(article);
    }

    else {
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

// /* initial examples of just beginning to work with express */
// // app.post('/hello', (req, res) => { /* res stands for result */
// //     console.log(req.body); /* req.body returns the json object as permitted on app.use(express.json()); */
// //     res.send(`hello ${req.body.name}!`);
// // });

// // app.get('/hello/:name', (req, res) => { /* parameter names for routes begin w/ a : (e.g. name is a parameter for this route) */
// //     const name = req.params.name; /* req.params returns an object containing of the url parameters in '/hello/:name' and their values (e.g. in this example, when on localhost:8000/skylar,, req.params = { name: 'skylar' }) */
// //     res.send(`hello ${name}!`) /* when on localhost:8000/skylar, the endpoint returns "hello skylar!" (MAKE SURE TO USE BACKTICKS AROUND THE STR OR ELSE THE ${name} WILL NOT BE EXTRACTED) */
// // });
