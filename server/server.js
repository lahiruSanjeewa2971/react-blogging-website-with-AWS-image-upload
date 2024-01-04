import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config'
import bcrypt from 'bcrypt'
import User from './Schema/User.js';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import admin from 'firebase-admin';
import serviceAccountKey from './my-own-blogging-website-firebase-adminsdk-umohh-5c1e5ba9ac.json' assert { type: "json" };
import { getAuth } from 'firebase-admin/auth';
import aws from 'aws-sdk';

const server = express();
server.use(express.json());
server.use(cors());
let PORT = 3000;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
});

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true
})



// connecting to AWS
// setting up s3 bucket
const s3 = new aws.S3({
    region: 'ap-south-1',
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})


const generateUploadURL = async () => {
    const date = new Date();
    const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

    return await s3.getSignedUrlPromise('putObject', {
        Bucket: 'my-own-blogging-website',
        Key: imageName,
        Expires: 1000,
        ContentType: 'image/jpeg'
    })
}



// data set to frontend
const formatDataToSend = (user) => {
    const accessToken = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY);

    return {
        accessToken,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.username
    }
}

// generate a userName
const generateUserName = async (email) => {
    let username = email.split("@")[0];

    let isUserNameNotUnique = await User.exists({ "personal_info.username": username })
        .then((result) => result)

    isUserNameNotUnique ? username += nanoid().substring(0, 5) : "";

    return username;
}

// routes for signup
server.post("/signup", (req, res) => {
    let { fullname, email, password } = req.body;

    // validate user inputs
    if (fullname.length < 3) {
        return res.status(403).json({ "error": "Full name at least 3 character long." });
    }
    if (!email.length) {
        return res.status(403).json({ "error": "Please enter an email." });
    }
    if (!emailRegex.test(email)) {
        return res.status(403).json({ "error": "Please enter a valid email." });
    }
    if (!passwordRegex.test(password)) {
        return res.status(403).json({ "error": "Password should be 6 - 20 characters long with a numeric, 1 lowercase, and 1 uppercase." });
    }

    // password hash
    bcrypt.hash(password, 10, async (err, hashed_password) => {
        let username = await generateUserName(email);
        let user = User({
            personal_info: { fullname, email, password: hashed_password, username }
        })

        user.save()
            .then((u) => {
                return res.status(200).json(formatDataToSend(u));
            })
            .catch(err => {
                // catch duplicate field error
                if (err.code == 11000) {
                    return res.status(500).json({ "error": "email is exist, please use different email." })
                }

                return res.status(500).json({ "error": err.message })
            })
    })
})

// routes for signin
server.post("/signin", (req, res) => {
    let { email, password } = req.body;

    User.findOne({ "personal_info.email": email })
        .then((user) => {
            if (!user) {
                return res.status(403).json({ "error": "Email not found" });
            }

            if (!user.google_auth) {
                // password compare
                bcrypt.compare(password, user.personal_info.password, (err, result) => {
                    if (err) {
                        return res.status(403).json({ "error": "Error occured. Please try again." });
                    }
                    if (!result) {
                        return res.status(403).json({ "error": "Incorrent password" });
                    }
                    else {
                        return res.status(200).json(formatDataToSend(user));
                    }
                })
            }
            else {
                return res.status(403).json({ "error": "Account was created using Google auth. Try logging with Google." })
            }
        })
        .catch(err => {
            // console.log(err);
            return res.status(500).json({ "error": err.message });
        })
})

server.post("/google-auth", async (req, res) => {
    let { accessToken } = req.body;
    getAuth().verifyIdToken(accessToken)
        .then(async (decodedUser) => {
            let { email, name, picture } = decodedUser;

            picture = picture.replace("s96-c", "s384-c");

            // finding a user that is being logged throught google auth, in the database.
            let user = await User.findOne({ "personal_info.email": email }).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth")
                .then((u) => {
                    return u || null;
                })
                .catch(err => {
                    return res.status(500).json({ "error": err.message });
                })

            if (user) {
                if (!user.google_auth) {
                    return res.status(403).json({ "error": "This email was signed up without google. Please log in with password to access the account." })
                }
            }
            else {
                let username = await generateUserName(email);

                user = new User({
                    personal_info: { fullname: name, email, profile_img: picture, username },
                    google_auth: true
                })

                await user.save()
                    .then((u) => {
                        user = u;
                    })
                    .catch(err => {
                        return res.status(500).json({ "error": err.message });
                    })
            }
            return res.status(200).json(formatDataToSend(user));
        })
        .catch(err => {
            return res.status(500).json({ "error": "Failed to authenticate you with google. Try with other google account." });
        })
})

// upload image and get URl
server.get('/get-upload-url', (req, res) => {
    generateUploadURL()
        .then((url) => {
            res.status(200).json({ uploadURL: url });
        })
        .catch(err => {
            console.log('error while getting url :', err.message);
            return res.status(500).json({ error: err.message });
        })
})


server.listen(PORT, () => {
    console.log("Listening on PORT -> " + PORT);
})