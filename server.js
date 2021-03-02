require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");

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
    console.log("Listening on http://localhost:3000");
});