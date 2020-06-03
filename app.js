var dotenv = require('dotenv').config(); //Credentials for MongoDB
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var expressSanitizer= require('express-sanitizer');
var mongoose = require('mongoose');
var express = require('express');

app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"))
app.use(expressSanitizer());

mongoose.connect(process.env.DB_CONNECT)
.then(() => console.log(`Database connected`))
.catch(err => console.log(`Database connection error: ${err.message}`));



var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created:{type: Date, default: Date.now}
});

var Blog = mongoose.model ("Blog", blogSchema);

app.get("/", function(req,res){
    res.redirect("/blogs");
})
//INDEX ROUTE
app.get("/blogs", function(req,res){
    Blog.find({}, function(err,blogs){
        if(err){
            console.log(err)
        }else{
            res.render("index", {blogs:blogs});
        }
    })
});

//NEW ROUTE
app.get("/blogs/new", function(req,res){
    res.render("new");
});

//CREATE ROUTE
app.post("/blogs", function(req, res){
    //Saniize description
    req.body.blog.body = req.sanitize(req.body.blog.body);
     //create blog
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        }else{
            res.redirect("/blogs");
        }
        
    });
});

//SHOW ROUTE
app.get("/blogs/:id", function(req,res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("show", {blog:foundBlog});
        }

    });    
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req,res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
     res.redirect("/blogs");
        }else{
            res.render("edit", {blog:foundBlog});
        }
    })
});

//UPDATE ROUTE
app.put("/blogs/:id", function(req,res){
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs/" + req.params.id);
        }
    })
});

//DELETE ROUTE
app.delete("/blogs/:id", function(req,res){
    //Saniize description
    req.body.blog.body = req.sanitize(req.body.blog.body);
    //Delete route
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs");  
        }
    })
});

app.listen(process.env.PORT || 3000, process.env.IP, function(){
    console.log("App is running");
});