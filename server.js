/**
 * @file Simple express.js to-do backend with Mongo Atlas integration through Mongoose based on Angela Yu's AppBrewery Bootcamp
 * @author Felipe Sciammarella <felipe.sciammarella@gmail.com>
 * @copyright Felipe Sciammarella 2021
 * @license ISC
 */

/*
 * Utilities
 */
require("dotenv").config();
const _ = require("lodash");
const dayjs = require("dayjs");

/*
 * Express configuration
 */
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set('view options', {
    delimiter: "%"
});
app.use(bodyParser.urlencoded({
    extended: true
}));

/*
 * Mongoose Configuration
 */

const mongoose = require("mongoose");

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

/*
 * Data Schema definitions
 */

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

/*
 * Function declarations
 */

function deleteTask(taskList, _id, cb = () => {}) {
    /** 
     * @summary Removes a task from the TaskList document and optionally chains a callback
     * @param TaskList taskList - Tasklist document from which the task will be removed.
     * @param ObjectID _id - task subdocument id.
     */

    let to_delete = taskList.tasks.id(_id);
    if (to_delete) {
        to_delete.remove();
    }
    taskList.save().then(cb);
}

function updateDoneTasks(taskList, _ids) {
    /** 
     * @summary udpate done Tasks from a tasklist 
     * @param TaskList taskList - Tasklist document from which the task will be updated.
     * @param ObjectID _ids - subdocument ids of tasks marked as done.
     */
    for (task of taskList.tasks) {
        if (_ids.includes(task._id.toString())) {
            task.done = true;
        } else {
            task.done = false;
        }
    }
}

/*
 * Endpoints configuration
 */

app.get("/", (req, res) => {

    let query = dayjs().format("DD-MM-YYYY");
    List.findOne({
        name: query
    }, (err, result) => {
        if (!result) {
            result = new List({
                name: query
            });
        }
        result.save().then(
            () => {
                res.render("todo", {
                    list: result
                })
            }

        ).catch((err) => {
            console.error(err)
        });
    });

});

app.get("/:listName", (req, res) => {
    let query = req.params.listName;
    if (query == "favicon.ico") {
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
            }).catch((err) => {
                console.error(err)
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

        const redirect = () => {
            res.redirect("/" + req.params.listName)
        }

        if (req.body.delete) {
            deleteTask(result, req.body.delete, redirect)
            return;
        }

        if (req.body.id) {
            updateDoneTasks(result, req.body.id);
        }

        if (req.body.newTask) {
            task = {
                description: req.body.newTask,
                done: false
            };
            result.tasks.push(task);
        };
        result.save().then(redirect).catch((err) => {
            console.error(err)
        });
    })
});


app.post("/:listName/clear", (req, res) => {
    /*
     * "Hidden" route that clears all saved tasks
     */
    List.update({
        "tasks.done": true
    }, {
        "$pull": {
            "tasks": {
                "done": true
            }
        }
    }).then(() => {
        res.redirect("/" + req.params.listName)
    }).catch((err)=>{console.error(err)});
})


app.listen(process.env.PORT || 3000, () => {
    console.log(`Listening on http://localhost:${process.env.PORT || 3000}`);
});