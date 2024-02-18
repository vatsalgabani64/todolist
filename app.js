//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/todolistDB");
mongoose.connect("mongodb+srv://admin-vatsal:asdfasdf@cluster0.vaxsrbh.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = Item({
  name: "Welcome to todolist!"
});
const item2 = Item({
  name: "This is an example item!"
});
const item3 = Item({
  name: "One more item!"
});

const defaultItems = [item1, item2, item3]

const listSchema = {
  name:String,
  items:[itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", async function (req, res) {
  const items = await Item.find({});
  if(items.length === 0){
    Item.insertMany(defaultItems);
    res.redirect("/");
  }else{
    res.render("list", { listTitle: "Today", newListItems: items });
  }
});

app.get("/:customListName",async function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  const customList = await List.findOne({'name':customListName});
  if(customList){
    res.render("list",{listTitle:customList.name, newListItems: customList.items});
  }else{
    const list = new List({
      name:customListName,
      items:defaultItems
    });
  
    list.save();
    res.redirect("/"+customListName);
  }

});

app.post("/", async function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    const list = await List.findOne({name:listName});
    list.items.push(item);
    list.save();
    res.redirect("/"+listName);
  }
  
});

app.post("/delete", async function(req,res){
  // console.log(req.body);
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    try{
      await Item.deleteOne({"_id" : checkedItemId});
      res.redirect("/");
    }catch(err){
      console.log(err);
    }
  }else{
    try{
      await List.findOneAndUpdate({name:listName},{$pull : {items : {_id : checkedItemId}}});
      res.redirect("/"+listName);
    }catch(err){
      console.log(err);
    }
  }

})

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
