require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.set("view engine", "ejs");
app.set('view options',{delimiter:"%"});
app.use(bodyParser.urlencoded({extended:true}));

app.get("/", (req,res)=>{
    res.render("hello",{text:["Greetings","stranger "].join(", ")});
});

app.listen(3000,()=>{
    console.log("Listening on http://localhost:3000");
})