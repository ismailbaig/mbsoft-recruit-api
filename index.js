import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/mbsoftrecruitdb', { 
    useNewUrlparser: true,
    useunifiedTopology: true
}, () => {
    console.log("mongo (mbsoft recruit) db connected!!");
});

// Mongoose Schema - Start
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    id: Number,
});


const Users = new mongoose.model("User", userSchema);

// Mongoose Schema - End

//Application Routes - Start
app.post("/login", (req, res) => {
    const { uid, pd } = req.query;
    Users.findOne({name: uid, password: pd}, (err, user) => {
        if(err) {
            res.status(500).json({
                message: 'Error'
                });
        }
        if(user) {
            let userdata = {
                username: uid,
                password: pd
            }
            let token = jwt.sign(userdata, options.skey, {
                algorithm: 'HS256',
                expiresIn: '60m'
            });

            res.status(200).json({
                message: 'Login Successful',
                jwtoken: 'Bearer ' + token
                });

        }else {
            res.status(401).json({
                message: 'Login Failed 2'
                });
        }
    });
});

app.post("/register", (req, res) => {
    console.log(req.query);
    const { name, email, password} = req.query;

    Users.findOne({email: email}, (err, user) => {
        if(user) {
            res.send({message: "User already exists"})
        } else {
            const user = new Users({
                name, email, password
            });

            user.save(err => {
                if(err){
                    res.send(err)
                } else {
                    res.send({message: "User registered scuccessfully!!"})
                }
            });
        }
    });
});




//Application Routes - End


// Test Routes - START
app.post("/testtoken", verifyToken, (req, res, next) => {
    jwt.verify(req.token, options.skey, (err, data) => {
        if(err){
            res.status(403).json({
                message: "Invalid Token !!",        
              });
        } else {

            res.status(200).json({
                message: "Token validated 11 !!", 
                addFn2: addFn(1,20)       
              });
        }            
    })
});

app.get("/test", (req, res) => {
    res.send("test");
});



// update pd using name
app.post("/uppd", (req, res) => {
    const { name, pd} = req.query;
    Users.updateOne({name: name}, { $set : { password : pd }}, (err, data) => {
        if(err){
            res.status(403).json({
                message: "NOT Updated !!",        
              });
        } else {
            res.status(200).json({
                updtedData: data     
              });
        }  
    });
});



// Test Routes - END

//Middle ware
function verifyToken(req, res, next) {

    const bearerHeader = req.headers["authorization"];
  
    if (typeof bearerHeader !== "undefined") {
  
      const bearerToken = bearerHeader.split(" ")[1];
  
      req.token = bearerToken;
  
      next();
  
    } else {
  
      res.sendStatus(403);
  
    }
  
}

app.listen(9600, () => {
    console.log("hi from Node from 9600!!")
});

/*
var MongoClient = require('mongodb').MongoClient;
//Create a database named "mydb":
var url = "mongodb://localhost:27017/mydb";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});

*/
