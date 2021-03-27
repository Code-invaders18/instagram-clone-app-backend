require("dotenv").config();

const express=require('express')
const router=express.Router()
const mongoose=require('mongoose');

const requirelogin = require("../middleware.js/requirelogin");
const Post=require('../models/post')

router.post('/createpost',requirelogin,(req,res)=>{
    const { title,body,pic }=req.body
    console.log(title,body,pic)
    if(!title || !body || !pic){
        return res.status(422).json({error:"Please add all the Fields"})
    }
    req.user.password=undefined
    const post=new Post({
        title,
        body,
        photo:pic,
        postedBy:req.user
    })
    post.save().then(result=>{
        res.json({post:result})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.get('/allpost',requirelogin,(req,res)=>{
    Post.find()
    .populate("postedBy","email name _id")
    .populate("comments.postedBy","_id name")
    .sort('-createdAt')
    .then(posts=>{
        res.json({posts})
    }).catch(err=>{
        console.log(err)
    })
})

//route to get the suscribers post
router.get('/getsubpost',requirelogin,(req,res)=>{
    //if postedBy in following (this is made understand in the context of python language)
    Post.find({postedBy:{$in:req.user.following}})
    .populate("postedBy","email name _id")
    .populate("comments.postedBy","_id name")
    .sort('-createdAt')
    .then(posts=>{
        res.json({posts})
    }).catch(err=>{
        console.log(err)
    })
})

router.get('/mypost',requirelogin,(req,res)=>{
    Post.find({postedBy:req.user._id})
    .populate("PostedBy","_id name")
    .then(mypost=>{
        res.json({mypost})
    })
    .catch(err=>{
        console.log(err)
    })
})
//route for liking the post

router.put('/like',requirelogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.user._id}
    },{
        new:true
    }).exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            return res.json(result)
        }
    })
})
//route for disliking the post

router.put('/unlike',requirelogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $pull:{likes:req.user._id}
    },{
        new:true
    }).exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            return res.json(result)
        }
    })
})
//route for commenting on the post
router.put('/comment',requirelogin,(req,res)=>{
    const comment={
        text:req.body.text,
        postedBy:req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment}
    },{
        new:true
    })
    //now we will have to populate postedBy field for name and other details.
    .populate("comments.postedBy","_id name")
    .populate("postedBy","_id name")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            return res.json(result)
        }
    })
})

//delete post route
router.delete('/deletepost/:postId',requirelogin,(req,res)=>{
    Post.findOne({_id:req.params.postId})
    .populate("postedBy","_id")
    .exec((err,post)=>{
        if(err || !post){
            return res.status(422).json({error:err})
        }
        if(post.postedBy._id.toString() === req.user._id.toString()){
            post.remove()
            .then(result=>{
                res.json(result)
            })
            .catch(err=>{
                console.log(err)
            })
        }
    })
})

router.put('/updatePic',requirelogin,(req,res)=>{

    //here we have used the documentation of findByIdAndUpdate

    User.findByIdAndUpdate(req.user._id,{$set:{pic:req.body.pic}},{new:true},
        (err,result)=>{
           if(err){
               return res.status(422).json({error:"Pic cannot be posted"})
           }
           res.json(result)
        }
        )
})

module.exports=router