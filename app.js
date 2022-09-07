const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const _ = require('lodash')
dotenv.config()
app.use(bodyParser.urlencoded({
  extended: true
}))
app.set('view engine', 'ejs');
const port = 3000
mongoose.connect(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.gbmtnno.mongodb.net/todoListDB`, {
  useNewUrlParser: true
})
// ---------------------------------itemSchema
const itemsSchema = new mongoose.Schema({
  name: String,
})
const Item = mongoose.model('Item', itemsSchema)

const item1 = new Item({
  name: 'Welcome to your todoList'
})
const item2 = new Item({
  name: 'Hit the + buttom do add a new item'
})
const item3 = new Item({
  name: '<--- Hit this to delete an item'
})
const defaultItems = [item1, item2, item3]
// ---------------------------------------------ListSchema
const ListSchema = {
  name: String,
  items: [itemsSchema]
}
const List = mongoose.model('List', ListSchema)

// --------------------------------------USE
app.use(express.static('public')) //pasta com arquivos de imagem, css etc

// ----------------------ROUTE-------
// -------------------------- Home
app.get('/', function(req, res) {

  //buscar items no servidor
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log('Successfully inserted');
        }
      })
      res.redirect('/')
    } else {
      res.render('list', {
        listTitle: 'Today',
        foundItems
      })
    }
  });

})
app.get('/:customListName', function(req, res) {

  const customListName = _.capitalize(req.params.customListName)

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save()
        res.redirect('/' + customListName)
      } else {
        //show an existem list
        res.render('list', {
          listTitle: foundList.name,
          foundItems: foundList.items
        })
      }
    }
  })


})

app.post('/', function(req, res) {

  const listName = req.body.list
  const itemName = req.body.newItem

  const item = new Item({
    name: itemName
  })
  if (listName === 'Today') {
    item.save()
    res.redirect('/')
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item)
      foundList.save()
      res.redirect('/' + listName)
    })
  }


})

app.post('/delete', function(req, res) {
  const checkBoxId = req.body.checkbox;
  const listName = req.body.listName

  if (listName === 'Today') {
    Item.findByIdAndRemove(checkBoxId, function(err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/')
      }
    })
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkBoxId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect('/' + listName)
      }
    })

  }


})



// ------------------------------listen
app.listen(port, function() {
  console.log('running ' + port)
})
