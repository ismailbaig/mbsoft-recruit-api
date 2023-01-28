import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { options } from './options.js';
import multer from 'multer';
import path from 'path';


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
    role: String,
});


const Users = new mongoose.model("User", userSchema);

// Mongoose Schema - End


// View Engine Setup
app.set("views", path.join("views"))
app.set("view engine", "ejs")

//Application Routes - Start
app.post("/login", (req, res) => {
    const { uid, pd } = req.body;
    Users.findOne({ name: uid, password: pd }, (err, user) => {
        if (err) {
            res.status(500).json({
                message: 'Error'
            });
        }
        if (user) {
            let userdata = {
                username: uid,
                password: pd,
                role: user.role
            }
            let token = jwt.sign(userdata, options.skey, {
                algorithm: 'HS256',
                expiresIn: '60m'
            });

            res.status(200).json({
                message: 'Login Successful',
                jwtoken: 'Bearer ' + token
            });

        } else {
            res.status(401).json({
                message: 'Login Failed 2'
            });
        }
    });
});

app.post("/register", (req, res) => {
    console.log(req.query);
    const { name, email, password } = req.query;

    Users.findOne({ email: email }, (err, user) => {
        if (user) {
            res.send({ message: "User already exists" })
        } else {
            const user = new Users({
                name, email, password
            });

            user.save(err => {
                if (err) {
                    res.send(err)
                } else {
                    res.send({ message: "User registered scuccessfully!!" })
                }
            });
        }
    });
});

//Application Routes - End

// Test Routes - START

app.post("/testtoken", verifyToken, (req, res, next) => {
    jwt.verify(req.token, options.skey, (err, data) => {
        if (err) {
            res.status(403).json({
                message: "Invalid Token !!",
            });
        } else {

            res.status(200).json({
                message: "Token validated 11 !!",
                addFn2: addFn(1, 20)
            });
        }
    })
});

app.get("/test", (req, res) => {
    res.send("test");
});

// update pd using name
app.post("/uppd", (req, res) => {
    const { name, pd } = req.query;
    Users.updateOne({ name: name }, { $set: { password: pd } }, (err, data) => {
        if (err) {
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

// var upload = multer({ dest: "Upload_folder_name" })
// If you do not want to use diskStorage then uncomment it

var storage = multer.diskStorage({
    destination: function (req, file, cb) {

        // Uploads is the Upload_folder_name
        cb(null, "uploads")
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + ".jpg")
    }
})

// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 3 * 1000 * 1000;

var upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb) {

        // Set the filetypes, it is optional
        var filetypes = /jpeg|jpg|png/;
        var mimetype = filetypes.test(file.mimetype);

        var extname = filetypes.test(path.extname(
            file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }

        cb("Error: File upload only supports the "
            + "following filetypes - " + filetypes);
    }

    // mypic is the name of file attribute
}).single("mypic");

app.get("/", function (req, res) {
    res.render("Signup");
})

app.post("/uploadProfilePicture", function (req, res, next) {

    // Error MiddleWare for multer file upload, so if any
    // error occurs, the image would not be uploaded!
    upload(req, res, function (err) {

        if (err) {

            // ERROR occurred (here it can be occurred due
            // to uploading image of size greater than
            // 1MB or uploading different file type)
            res.send(err)
        }
        else {

            // SUCCESS, image successfully uploaded
            res.send("Success, Image uploaded!")
        }
    })
})

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

