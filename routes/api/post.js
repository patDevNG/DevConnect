const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const Profile = require('../../models/Profile');

//@route         POST/api/v1/post
//@description   create post
//@access        Private


router.post('/', [
    auth, [
        check('text', 'Text is required').not().isEmpty()
    ]
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(401).json({ error: [{ error: errors.array() }] });
        }
        try {
            const user = await User.findById(req.user.id).select('-password');
            newPost = new Post({
                text: req.body.text,
                name: user.name,
                avarta: user.avarta,
                user: req.user.id
            });
            const post = await newPost.save();
            return res.status(200).json({ data: [{ data: post }] })
        } catch (e) {
            console.log(e.message);
            return res.status(500).json({ error: [{ message: "Internal server error" }] })

        }
    }

);


//@route         get/api/v1/post
//@description   fetch all posts
//@access        Private

router.get('/', auth, async (req, res) => {
    try {
        const post = await Post.find().sort({ date: -1 });
        if (!post) {
            return res.status(404).json({ error: [{ error: "post not found" }] })
        }
        return res.status(200).json({ data: [{ posts: post }] })
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ error: [{ error: "internal server error" }] })
    }
});

//@route         GET/api/v1/post
//@description   fetch a particular post
//@access        Private

router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: [{ message: "post not found" }] })
        }
        return res.status(200).json({ data: [{ post: post }] })
    } catch (e) {
        if (e.kind === 'ObjectId') {
            return res.status(404).json({ error: [{ message: "post not found" }] })
        }
        console.log(e.message);
        return res.status(500).json({ error: [{ message: "internal server errror" }] })
    }
})


//@route         DELETE/api/v1/post
//@description   delete a particular post
//@access        Private

router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: [{ message: "post not found" }] })
        }
        if (post.user != req.user.id) {
            return res.status(401).json({ error: [{ message: 'unauthorized user' }] })
        }
        await post.remove();
        return res.status(200).json({ data: [{ message: "post successfully deleted" }] })
    } catch (e) {
        console.log(e.message);
        if (e.kind === 'ObjectId') {
            return res.status(404).json({ error: [{ message: "post not found" }] })
        }
        return res.status(500).json({ error: [{ message: "internal server error" }] })
    }
});

//@route         PUT/api/v1/post/like/:id
//@description   like a post
//@access        Private

router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
            if(!post){
                return res.status(404).json({error:[{message:"post not found"}]})
            }
        if (post.likes.filter(like => like.user.toString() === req.user.id).length >0) {
            return res.status(401).json({ error: [{ message: "post already liked" }] })
        }
        post.likes.unshift({user:req.user.id})
        await post.save();
        return res.status(200).json({ data: [{ likes: post.likes }] })
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ error: [{ message: "internal server error" }] })
    }
})

//@route         PUT/api/v1/post/unlike/:id
//@description   like a post
//@access        Private

router.put('/unlike/:id', auth, async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
            if(!post){
                return res.status(404).json({error:[{message:"post not found"}]})
            }
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(401).json({ error: [{ message: "post has not being liked" }] })
        }
        //get remove index
        const removeIndex = post.likes.map(like=> like.user.toString()).indexOf(req.user.id)
        post.likes.splice(removeIndex,1);
        await post.save();
        return res.status(200).json({ data: [{ likes: post.likes }] })
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ error: [{ message: "internal server error" }] })
    }
})

//@route         POST/api/v1/post/comment/:id
//@description   comment on a post
//@access        Private


router.post('/comment/:id', [
    auth, [
        check('text', 'Text is required').not().isEmpty()
    ]
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(401).json({ error: [{ error: errors.array() }] });
        }
        try {
            const user = await User.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.id)
            const comment ={
                text: req.body.text,
                name: user.name,
                avarta: user.avarta,
                user: req.user.id
            };
            post.comments.unshift(comment);
            await post.save();
            return res.status(200).json({ data: [{ data: post }] })
        } catch (e) {
            console.log(e.message);
            return res.status(500).json({ error: [{ message: "Internal server error" }] })

        }
    }

);

//@route         POST/api/v1/post/comment/:id/:comment_id
//@description   comment on a post
//@access        Private

router.delete('/comment/:id/:comment_id', auth, async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({error:[{message:"post not found"}]});
        }

        //retrieve comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);
        if(!comment){
            return res.status(404).json({error:[{message:"comment not found"}]})
        }
        //confirm that the user logged in made the comment
        if(comment.user.toString() !== req.user.id){
            return res.status(401).json({error:[{message:"unauthorized user"}]})
        }
        const removeIndex = post.comments.map(comment=> comment.user.toString()).indexOf(req.user.id)
        post.comments.splice(removeIndex,1);
        await post.save();
        return res.status(200).json({data:[{message:"comment removed"}]})
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({error:[{message:"internal server error"}]})
    }
})
module.exports = router;