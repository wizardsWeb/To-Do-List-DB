const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const port = 3000;

const app = express();
const ejs = require("ejs");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const todolistSchema = {
  tasks : String,
};

const todoTask = mongoose.model("todoTask", todolistSchema);

const task1 = new todoTask({
  tasks: "Buy Manga",
});

const task2 = new todoTask({
  tasks: "Read Manga",
});

const task3 = new todoTask({
  tasks: "Sell Manga",
});

const defaultTasks = [task1, task2, task3];

const listSchema = {
  name : String,
  tasks : [todolistSchema]
}

const List = mongoose.model("List", listSchema);




app.get("/", (req, res) => {
  todoTask.find({})
    .then((foundTasks) => {
      if (foundTasks.length === 0) {
        todoTask
          .insertMany(defaultTasks)
          .then(() => {
            console.log("Items add successfully");
            res.redirect("/");
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: foundTasks,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/:DynamicNames", (req, res) => {
  const DynamicName = req.params.DynamicNames;

  List.findOne({name : DynamicName})
  .then((foundList) => {
    if(!foundList){

      //create a new list

      // console.log("Doesn't exists");
      const list = new List ({
        name : DynamicName,
        tasks : defaultTasks
      });

    list.save();
    
    res.redirect("/" + DynamicName);

    }
    else{
      //show an existing list
      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.tasks,
      });
    }
  })
  .catch((err) => {
    console.log(err);
  })

  
  // console.log(DynamicName)

})

app.post("/", (req, res) => {
  const taskName = req.body.newItem;
  const listName = req.body.list;

  const item = new todoTask({
    tasks : taskName
  });

  console.log(listName);
  if(listName == "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name : listName})
    .then((foundList) => {
      console.log(foundList);
      foundList.tasks.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
    .catch((err) => {
      console.log(err);
    })
  }

});




app.post("/delete", (req, res) => {
  const checkedTaskItem = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
  todoTask.deleteOne({ _id: checkedTaskItem })
    .then(() => {
      console.log("Successfully Deleted that Item");
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
  }
  else {
    List.findOneAndUpdate({name : listName}, {$pull : {tasks: {_id : checkedTaskItem}}})
    .then((foundList) => {
      res.redirect("/" + listName);
    })
    .catch((err) => {
      console.log(err)
    })
  }
   

});



app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(port, () => {
  console.log(`The server is running on port ${port}`);
});
