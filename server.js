require("dotenv").config();
const _ = require("lodash");
const dayjs = require("dayjs");

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const {
    result
} = require("lodash");
const {
    query
} = require("express");
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;

const tasksSchema = new mongoose.Schema({
    description: {
        required: true,
        type: String,
        minLength: 1
    },
    done: Boolean
});
const listsSchema = new mongoose.Schema({
    tasks: [tasksSchema],
    date: {
        type: Date,
        default: Date.now
    },
    name: {
        required: true,
        type: String,
        minLength: 1
    },
});

const List = new mongoose.model("List", listsSchema);
// const Task = new mongoose.model("Task", tasksSchema);


const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set('view options', {
    delimiter: "%"
});
app.use(bodyParser.urlencoded({
    extended: true
}));


// const task = [
//     new Task({
//         description:"Do nothing",
//         done:false
//     }),
//     new Task({
//         description:"Buy Food",
//         done:false
//     }),
//     new Task({
//         description:"Sleep",
//         done:true
//     })
// ]

// const tasklist = new List({
//     name:dayjs().format("DD-MM-YYYY"),
//     tasks:[]
// });

// tasklist.tasks.push(...task);

// tasklist.save();


app.get("/", (req, res) => {
    let query = dayjs().format("DD-MM-YYYY");
    List.find({
        name: query
    }, (err, result) => {
        res.render("todo", {
            list: result[0]
        })
    });

});

app.get("/:listName", (req, res) => {
    let query = req.params.listName;
    if (query == "favicon.ico"){
        res.sendStatus(404);
    };

    List.findOne({
        name: query
    }, (err, result) => {
        if (!result) {
            let newList = new List({
                name: req.params.listName,
                tasks: []
            })
            newList.save().then(() => {
                res.redirect("/" + req.params.listName);
            });
        } else {
            res.render("todo", {
                list: result
            })
        }

    });

});

app.post("/:listName", (req, res) => {
    console.log(req.body);
    List.findOne({
        name: req.params.listName
    }, (err, result) => {
        if(req.body.delete){
            let to_delete = result.tasks.id(req.body.delete);
            if (to_delete){
                to_delete.remove();
            }
            result.save().then(()=>{
                res.redirect("/"+req.params.listName);
            });
            return;
        }

        req.body.id = req.body.id || [];
        for (task of result.tasks){
            console.log(task._id);
            if (req.body.id.includes(task._id.toString())){
                console.log("worked");
                task.done = true;
            }else{
                task.done = false;
            }
        }
        if (req.body.newTask) {
            task = {
                description: req.body.newTask,
                done: false
            };
            result.tasks.push(task);

        };
        result.save().then(() => {
            res.redirect("/" + req.params.listName)
        });
    })
});


app.post("/:listName/clear",(req,res)=>{
    List.update({
        "tasks.done": true
    },{
        "$pull":{
            "tasks":{
                "done":true
            }
        }
    }, function(err, result){
        console.error(err);
        console.log(result);
    }).then(
    ()=>{
        res.redirect("/"+req.params.listName)
    }        
    )
})


app.listen(process.env.PORT || 3000, () => {
    console.log(`Listening on http://localhost:${process.env.PORT || 3000}`);
});