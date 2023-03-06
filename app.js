const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

app.set("view engine", "ejs");
// Connecting to local mongodb
mongoose.connect("mongodb+srv://sample-user:asakanaman1@cluster0.hh3s0vf.mongodb.net/practicingDB");
// Schema
const todoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please check your data entry, name not specified"]
  }
})


// Collection/ Schema
const Todo = mongoose.model("Todo", todoSchema);

const todo1 = new Todo({
  name: "Welcome"
})

const todo2 = new Todo({
  name: "<--- Click this to delete an item"
})

const todo3 = new Todo({
  name: "Click the \"+\" button to add an item"
})

const todosArray = [todo1, todo2, todo3];

const titleSchema = new mongoose.Schema({
  name: String,
  items: [todoSchema]
})

const Title = mongoose.model("Title", titleSchema);

app.get("/", (req, res) => {
  Todo.find({}, (err, todos) => {
    if (todos.length === 0) {
      Todo.insertMany(todosArray, (err) => {
        if (!err) {
          console.log("Successfully added document");
        } else {
          console.log(err);
        }
      })

      res.redirect("/");
    }

    if (!err) {
      res.render("todo", {todos: todos, title: "Todo"});
    } else {
      console.log(err);
    }
  })
})

app.get("/:postName", (req, res) => {
  const params = req.params.postName;

  const title = new Title({
    name: params,
    items: todosArray
  })

  Title.findOne({name: params}, (err, titles) => {
    if (!titles) {
      title.save();
      res.redirect(`/${params}`); // This is what we inputted on the URI
    } else {
      res.render("todo", {title: titles.name, todos: titles.items});
    }
  })
})

app.post("/", (req, res) => {
  const todoInput = req.body.todoInput;
  const buttonValue = req.body.submitButton;

  const todo = new Todo({
    name: todoInput
  })

  if (buttonValue === "Todo") {
    todo.save();

    res.redirect("/");
  } else {
    Title.findOne({name: buttonValue}, (err, results) => {
      if (!err) {
        results.items.push(todo);
        results.save();
        res.redirect(`/${results.name}`);
      }
    })
  }
})

app.post("/delete", (req, res) => {
  const todoId = req.body.checkbox;
  const hidden = req.body.hidden;

  if (hidden === "Todo") {
    Todo.deleteOne({_id: todoId}, (err) => {
      if (!err) {
        console.log("Successfully deleted a document.");
        res.redirect("/");
      } else {
        console.log(err);
      }
    })
  } else {
    Title.findOneAndUpdate({name: hidden}, {$pull: {items: {_id: todoId}}}, (err) => {
      if (!err) {
        console.log("Successfully deleted a document.");
        res.redirect(`/${hidden}`);
      } else {
        console.log(err);
      }
    })
  }
})

app.listen(3000, () => {
  console.log("Server has started on port 3000.");
})