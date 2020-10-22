// importing
// const express = require('express')
// const mongoose = require('mongoose')
import Pusher from 'pusher'
import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessage.js'
// app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: '1094788',
    key: '0403401385d676f588cb',
    secret: 'bfe49276a63221ccb939',
    cluster: 'us2',
    encrypted: true
  });

// middleware

app.use(express.json())

// DB config
const connection_url = 'mongodb+srv://Random:PiL6q3ZHixD9Iur0@cluster0.m06he.mongodb.net/msgappdb?retryWrites=true&w=majority'

mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection

db.once('open', () => {
    console.log('DB connected')

    const msgCollection = db.collection('messagecontents')
    const changeStream = msgCollection.watch()

    changeStream.on('change', (change) => {
        console.log(change)

        if (change.operationType === 'insert') {
            const messageDetails = change.fullDocument
            pusher.trigger('messages', 'inserted',
                {
                    name: messageDetails.user,
                    message: messageDetails.message
                }
            )
        } else {
            console.log('Error triggering pusher')
        }
    })
})

// api routes
app.get('/',(req,res) => res.status(200).send('hello world'));

// // Get all messages
app.get('/messages/sync', (req, res) => {
    Messages.find((err, data) => {
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})
//Send a new message
app.post('/messages/new', (req, res) => {
    const dbMessage = req.body

    Messages.create(dbMessage, (err, data) => {
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
    })

})

// listener

app.listen(port, () => console.log(`listening on localhost:${port}`));
