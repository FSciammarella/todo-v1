require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected to mongo atlas");
  db.close();
});

const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set('view options',{delimiter:"%"});
app.use(bodyParser.urlencoded({extended:true}));
var tasks = [];

app.get("/", (req,res)=>{
    let today = new Date();
    var options={
        weekday:"long",
        day:"numeric",
        month:"long"
    }
    res.render("todo",{
        day: today.toLocaleDateString("pt-BR",options),
        tasks: tasks
    });
});

app.post("/",(req,res)=>{

    if(req.body.clear){
        tasks=[];
    }else{
        tasks.push(req.body.newTask);
    }
   res.redirect("/");
});

app.listen(process.env.PORT || 3000,()=>{
    console.log(`Listening on http://localhost:${process.env.PORT || 3000}`);
});