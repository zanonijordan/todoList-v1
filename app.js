const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const date = require(__dirname +'/date.js')
app.use(bodyParser.urlencoded({
  extended: true
}))
app.set('view engine', 'ejs');
const port = 3000
const items = []
const workItems = []

app.use(express.static('public')) //pasta com arquivos de imagem, css etc
// ----------------------ROUTE-------
// -------------------------- Home
app.get('/', function(req, res) {
  const day = date.getDay()

  res.render('list', {listTitle: day, items})
})

app.post('/', function(req, res) {
  console.log(req.body)
  let item = req.body.newItem

  if (req.body.list === 'Work') {
    workItems.push(item)
    res.redirect('/work')
  } else {
    items.push(item)
    res.redirect('/')
  }

})
// ------------------------------work
app.get('/work', function(req, res) {
  res.render('list', {
    listTitle: 'Work List',
    items: workItems
  })
})

app.post('/work', function(req, res) {
  let item = req.body.newItem
  workItems.push(item)
  res.redirect('/work')
})





// ------------------------------listen
app.listen(port, function() {
  console.log('running ' + port)
})
