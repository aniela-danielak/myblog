//include installed npm packages
var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require ("body-parser");
var expressSanitizer = require("express-sanitizer");
var methodOverride = require("method-override");

//setting app - configuration
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());

//connecting to DB
mongoose.Promise = global.Promise;

var databaseUri = "mongodb://localhost/myblog";
mongoose.connect(databaseUri, { useMongoClient: true })
      .then(() => console.log(`Database connected at ${databaseUri}`))
      .catch(err => console.log(`Database connection error: ${err.message}`));
      
//Creating Mongoose Schema
var postSchema = new mongoose.Schema ({
    image: String,
    title: String,
    created: {type: Date, default: Date.now},
    body: String,
    author: String,
    });
    
//Creating Mongoose Model
var Post = mongoose.model("Post", postSchema);

//Creating a new post in DB
/*
Post.create({
    image: "https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&s=63b9dfd6802672eab12f439e0b972010",
    title: "Workspace of a girlboss",
    body: "Let me tell you something awesome about my new life",
    author: "Aniela Danielak",
    });
*/


//RESTful ROUTING

//HOME
app.get("/", function(req, res){
    res.redirect("/posts");
});

//INDEX
app.get("/posts", function(req, res){
    //find all posts in DB scheme: Post.find(what you look for, callback function with error handling)
    Post.find({}, function(err, posts){
        if(err){
            console.log(err);
        } else{
            //show all posts from DB using index template where variable post will equal response from DB called post
             res.render("index", {posts: posts});
        }
    });
});

//NEW
app.get("/posts/new", function(req, res){
    //show a form to add new post
    res.render("new");
});

//CREATE
app.post("/posts", function(req, res){
    //sanitize what comes from user and undo any foreign scripts
    req.body.post.body = req.sanitize(req.body.post.body);
    //Get from the body of request all info about new post and create it in DB
    Post.create(req.body.post, function(err, newPost){
        if(err){
            res.redirect("/new");
        } else {
            res.redirect("/posts");
        }
    });
});


//SHOW
app.get("/posts/:id", function(req, res){
    //find a post by ID found in parameters
   Post.findById(req.params.id, function(err, foundPost){
     if(err){
         res.redirect("/posts");
     }  else{
         res.render("show", {post: foundPost});
     }
   });
});


//EDIT
app.get("/posts/:id/edit", function(req, res){
    //look for a post to edit by it's id
    Post.findById(req.params.id, function(err, foundPost){
        if(err){
            console.log(err);
        } else {
            res.render("edit", {post: foundPost});
        }
    });
    
});



//UPDATE
app.put("/posts/:id", function(req, res){
    //sanitize what comes from user and undo any foreign scripts
    req.body.post.body = req.sanitize(req.body.post.body);
    //update particular post: give id, what you want to change and callback function
    Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, updatedPost){
        if(err){
            res.redirect("/posts");
        } else {
       //redirect somewhere
       res.redirect("/posts/" + req.params.id);
        }
    });
});

//DELETE
app.delete("/posts/:id", function(req, res){
    Post.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/posts");
        } else {
            res.redirect("/posts");
        }
    });
});




//Server settings
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server here");
});