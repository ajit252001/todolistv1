const express = require("express");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

 
const app = express();
 
app.set("view engine", "ejs");
 
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
 
run();
async function run() {
  try {
    mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
 
    const itemsSchema = new mongoose.Schema({
      name: String,
    });
 
    const Item = mongoose.model("Item", itemsSchema);
 
    var item1 = new Item({
      name: "Pray the Fajr prayer",
    });
    var item2 = new Item({
      name: "Brush my teeth",
    });
    var item3 = new Item({
      name: "Learn to code",
    });
 
    const defaultItems = [item1, item2, item3];
    const listSchema = {
      name:String,
      items: [itemsSchema]
    };
    const List =mongoose.model("List", listSchema);
 
    // mongoose.connection.close();
 
    app.get("/", async function (req, res) {
      const day = date.getDate();
      const foundItems = await Item.find({});
 
      if (!(await Item.exists())) {
        await Item.insertMany(defaultItems);
        res.redirect("/");
      } else {
        res.render("list", { listTitle: day, newListItems: foundItems });
      }
    });
 
    app.post("/", function(req, res){
 
      const itemName = req.body.newItem;
      const listName = req.body.list;
      const day = date.getDate();
     
      const item = new Item({
        name: itemName
      });
     
      if(listName === day){
        item.save();
     
        res.redirect("/");
      }
      else{
        List.findOne({name : listName}).then(function(foundList){
          foundList.items.push(item);
          foundList.save();
          res.redirect("/" + listName);
        })
      }
     
    });
 // delete route 
 app.post("/delete", async function (req, res) {
  const checkedItemId = req.body.checkbox;
  if(checkedItemId != undefined){
  await Item.findByIdAndRemove(checkedItemId)
  .then(()=>console.log(`Deleted ${checkedItemId} Successfully`))
  .catch((err) => console.log("Deletion Error: " + err));
  res.redirect("/");
  }
});
    // customlist names
    app.get("/:customListName", function (req, res) {
      const customListName = req.params.customListName;
     
      List.findOne({ name: customListName })
        .then(function (foundList) {
          if (!foundList) {
            const list = new List({
              name: customListName,
              items: defaultItems,
            });
            list.save();
            res.redirect("/" + customListName);
          } else {
            res.render("list", {
              listTitle: foundList.name,
              newListItems: foundList.items,
            });
          }
        })
        .catch(function (err) {
          console.log(err);
        });
    });
 
    app.get("/about", function (req, res) {
      res.render("about");
    });
 
    app.listen(3000, function () {
      console.log("Server started on port 3000");
    });
  } catch (e) {
    console.log(e.message);
  }
}