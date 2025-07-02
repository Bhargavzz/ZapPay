require('dotenv').config();


const express = require("express");
const rootRouter=require("./routes/index");
const cors=require("cors");
const mongoose=require("mongoose");
const {MONGODB_URL}=require("./config");
const app=express();

app.use(express.json());
app.use(cors());
app.use("/api/v1",rootRouter);

mongoose.connect(MONGODB_URL)
.then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.log("MongoDB connection error:",err);
})


app.listen(3000);


