//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://shivam-atlas:uMfofCnDZs3eCMxB@cluster0.d93zu.mongodb.net/todolistDB");

const taskSchema = {
  name: String
};
//created task schema

const Task = mongoose.model("Task",taskSchema);
//creating the model

const webDev = new Task ({
  name: "Web Devlopement"
});

const leetcode = new Task ({
  name: "Leetcode"
});

const exercise = new Task ({
  name: "Exercise"
});

app.get("/", function(req, res) {
  Task.find({},function(err,result){
    if(result.length === 0){
      Task.insertMany(defaultTasks,function(err){
        if(err){
          console.log("an error accured");
        }else{
          console.log("succes");
        }
      });      
      res.redirect("/");
    } else{
      res.render("list", {listTitle: "Today", newListItems: result});
    }
    console.log(result);
  });
});

const defaultTasks = [webDev, leetcode,exercise];

app.post("/", function(req, res){

  const item = req.body.newItem;
  const submitList = req.body.list;

  const newTask = new Task({
    name: item
  });

  if(submitList === "Today"){
    newTask.save();
    res.redirect("/");
  } else{
    newList.findOne({name:submitList},function(err,result){
      if(!err){
        result.list.push(newTask);
        result.save();
        res.redirect("/"+submitList);
      }
    });
  }
});

app.post("/delete", function(req, res){
  let checkedItemId = req.body.checkbox;
  let listName = req.body.listName;
  console.log(listName);
  if(listName === "Today"){
    Task.findByIdAndRemove(checkedItemId,function(err){
      console.log("not able to delete ID : "+checkedItemId);
    })
    res.redirect("/");  
  }else{
    newList.findOneAndUpdate(
      {name: listName},
      {$pull: {list: {_id: checkedItemId}}},
      function(err,result){
        if(!err){
          res.redirect("/"+listName);
        }
      }
    );
  }
});

const listSchema = {
  name: String,
  list: [taskSchema]
}
const newList = mongoose.model("List",listSchema);

app.get("/:para",function(req,res){
  const parameter = _.capitalize(req.params.para);
  newList.findOne({name: parameter},function(err,result){
    if(!err){
      if(!result){
        console.log("not exits");
        const newTaskList = new newList({
          name: parameter,
          list: defaultTasks
        });
        newTaskList.save();
        res.redirect("/"+parameter);
      }else{
        console.log("exits");
        res.render("list",{listTitle:result.name,newListItems:result.list});
      }
    }
    });
});


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
