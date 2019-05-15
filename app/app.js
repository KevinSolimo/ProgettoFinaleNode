/*eslint-env node*/
const express = require('express');
const app = express();
// per gestire le richieste POST:
const bodyParser = require('body-parser');
//MongoDB
const MongoClient = require('mongodb').MongoClient;
//Filesystem per creare server HTTPS
const fs = require('fs');
const https = require('https');
//Cors per cossing site
const cors = require('cors');
//MySQL per Utenti
const mysql = require('mysql');
//Middleware
app.use(bodyParser.json({ type: "*/*" })); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(cors());

//HTTPS Server
const server = https.createServer({
  key: fs.readFileSync(__dirname + '/server.key'),
  cert: fs.readFileSync(__dirname + '/server.cert')
}, app);

//Home
app.get('/', function (req, res) {
  res.send({ message: 'WebService RESTful' });
});

//-----Request API-------//

// Register
app.post('/api/register', function (req, res) {

  var name = req.body.name;
  var surname = req.body.surname;
  var address = req.body.address;
  var city = req.body.city;
  var state = req.body.state;
  var postal = req.body.postal;
  var email = req.body.email;
  var user = req.body.user;
  var pass = req.body.pass;

  console.log(name + " " + surname + " " + address + " " + city + " " + state + " " + postal + " " + email + " " + user + " " + pass);

  var con = mysql.createConnection({
    host: "dbintance.clfeqo0cjm9g.us-east-1.rds.amazonaws.com",
    user: "root",
    password: "password",
    database: "Mono-Rent"
  });

  var sql = "INSERT INTO User (name, surname, address, city, state, postal, email, user, pass) VALUES ('" + name + "','" + surname + "','" + address + "','" +
    city + "','" + state + "','" + postal + "','" + email + "','" + user + "','" + pass + "')";

  con.connect(function (err) {
    if (err) throw err;
    con.query(sql, function (err, result, fields) {
      if (err) res.send({ state: 'ko' });;
      res.set({
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Access-Control-Allow-Origin': '*'
      })
      res.send({ state: 'ok' });
    });
  });
});
// Load Position Scooter
app.get('/api/monopattini', function (req, res) {
  MongoClient.connect('mongodb+srv://ksolimo:wkyP8ch7MvVZnul8@cluster0-yosjr.mongodb.net/test?retryWrites=true,{useNewUrlParser: true}', function (err, db) {
    if (err) {
      throw err;
    }
    var dbo = db.db("Mono-Rent");
    var query = {};
    dbo.collection("Monopattini").find(query).toArray(function (err, result) {
      if (err) {
        throw err;
      }
      db.close();
      res.send(result);
    });
  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
