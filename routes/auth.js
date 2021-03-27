require("dotenv").config();

const express=require('express')
const router=express.Router()
const mongoose=require('mongoose')
const User=require('../models/user')
const bcrpyt=require('bcryptjs')
const crypto=require('crypto')
const jwt=require('jsonwebtoken');
const requirelogin = require("../middleware.js/requirelogin");
const nodemailer=require('nodemailer')
const sendgridTransport=require('nodemailer-sendgrid-transport')

//we have used this to send the mails
const transporter=nodemailer.createTransport(sendgridTransport({
        auth:{
            api_key:"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"
        }
    }))
    


router.get('/protected',requirelogin,(req,res)=>{
    res.send('hello welcome to protected route')
})

router.post('/signup',(req,res)=>{
    const {email,password,name,pic}=req.body
    if(!email || !password || !name){
      return res.json({error:"All the fields are mandatory to be entered"})
    }
    User.findOne({email:email})
    .then((savedUser)=>{
        if(savedUser){
            return res.status(422).json({error:'User already exist with the same email'})
        }
        bcrpyt.hash(password,12)
        .then(hashedPassword=>{
            const user= new User({
                email,
                password:hashedPassword,
                name,
                pic
            })
            user.save()
            .then(user=>{
                transporter.sendMail({
                        to:user.email,
                        from:"noreply@gmail.com",
                        subject:"Signup Made Successfully",
                        html:"<h1>Welcome to Instagram</h1>"
                    })
                res.json({message:"User Saved successfully"})
            })
        })
    })
   
})

router.post('/signin',(req,res)=>{
    const {email,password}=req.body
    if(!email || !password){
        return res.status(422).json({ error:"Every field is mandatory."})
    }
    User.findOne({email:email})
    .then(savedUser=>{
        if(!savedUser){
            return res.status(422).json({error:"Invalid email-id or password"})
        }
        bcrpyt.compare(password,savedUser.password)
        .then(doMatch=>{
            if(doMatch){
                //return res.json({message:"Signed in successfully"})
                const token=jwt.sign({_id:savedUser._id},process.env.SEC)
                const {email, _id, name,followers,following,pic}=savedUser
                return res.json({token, user:{_id, name, email,followers,following,pic}})
            }
            return res.status(422).json({error:"Invalid email or password"})
        })
    })
    .catch(err=>{
        console.log(err)
    })
})
//router to reset the password via email through nodemailer
router.post('/reset-password',(req,res)=>{
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err)
        }
        const token=buffer.toString("hex")
        User.findOne({email:req.body.email})
        .then(user=>{
            if(!user){
                return res.status(422).json({error:"User doesn't exist with the email Id"})
            }
            user.resetToken=token
            user.expireToken=Date.now()+36000000
            user.save().then((result)=>{
                transporter.sendMail({
                    to:user.email,
                    from:"vanshmalik18@gmail.com",
                    subject:"Password Reset",
                    html:`
                    <p>You are requested for the password reset</p>
                    <h5>Click on this <a href="http://localhost:3000/reset/${token}">link</a> to reset the password</h5>
                    `
                })
                res.json({message:"Reset mail has been sent!!.."})
            })
        })
    })
})
router.post('/new-password',(req,res)=>{
    const newPassword=req.body.password
    const sentToken=req.body.token
    //here $gt means greater than.
    //expireToken should be greater than the current time.
    User.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
    .then(user=>{
        if(!user){
            return res.status(422).json({error:"Try again, your session has been expired"})
        }
        bcrpyt.hash(newPassword,12).then(hashedPassword=>{
            user.password=hashedPassword
            user.resetToken=undefined
            user.expireToken=undefined
            user.save().then((saveduser=>{
                res.json({message:"Password Updated successfully!!"})
            }))
            .catch(err=>{
                console.log(err)
            })

        })
    })
})
module.exports= router;
// 
//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
// 