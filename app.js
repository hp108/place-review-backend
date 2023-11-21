import express from 'express'
import bodyParser from 'body-parser'
import { placeRoute } from './routes/places-route.js';
import { userRoute } from './routes/users-route.js';
import { HttpError } from './model/http-error.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const DB_USERNAME = process.env.DB_USERNAME
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_NAME = process.env.DB_NAME


const app = express()

app.use(bodyParser.json())

app.use((req,res,next)=>{

    res.setHeader('Access-Control-Allow-Origin','*')
    res.setHeader('Access-Control-Allow-Headers','Origin,X-Requested-With,Content-Type,Accept,Authorization')
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE')
    next()
})

app.use('/api/places',placeRoute);

app.use('/api/users',userRoute);

app.use((req,res,next)=>{
    throw new HttpError("Could not find the route", 404);
})

app.use((error,req,res,next)=>{
    if(res.headerSent)
    {
        return next(error);
    }
    res.status(error.code || 500)
    res.json({'message': error.message || 'an error occured'})
})

mongoose.connect(`mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.suaqdxj.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`).then(()=>{

app.listen(4000,()=>{
    console.log('running in port number 4000')
});
}).catch((err)=>{
    console.log(err)

});

