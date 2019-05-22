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
//Crypto for password
const CryptoJS = require("crypto-js");

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
  var salt = req.body.salt;

  console.log(name + " " + surname + " " + address + " " + city + " " + state + " " + postal + " " + email + " " + user + " " + pass);

  var con = mysql.createConnection({
    host: "remotemysql.com",
    user: "3o3P0EL5IV",
    password: "8qvBnvPGDC",
    database: "3o3P0EL5IV"
  });

  var checkUsername = "SELECT * FROM Utenti WHERE Username = " + con.escape(user);

  con.connect(function (err) {
    if (err) throw err;
    con.query(checkUsername, function (err, result, fields) {
      if (err) throw err; //res.send({ state: 'ko' });;
      if (!result[0]) {

        var sql = "INSERT INTO Utenti (Name, Surname, Address, City, State, PostalCode, Email, Username, Password, Salt) VALUES ('" + name + "','" + surname + "','" + address + "','" +
          city + "','" + state + "','" + postal + "','" + email + "','" + user + "','" + pass + "','" + salt + "')";

        con.connect(function (err) {
          if (err) throw err;
          con.query(sql, function (err, result, fields) {
            if (err) throw err; //res.send({ state: 'ko' });;
            res.set({
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              'Access-Control-Allow-Origin': '*'
            })
            res.send({ state: 'ok' });
          });
        });

      }else {
        res.send({ state: 'user exist' });
      }
    });
  });
});
//Login
app.get('/api/login/:user/:pass', function (req, res) {

  var user = req.params.user;
  var pass = req.params.pass;

  console.log(user);

  var con = mysql.createConnection({
    host: "remotemysql.com",
    user: "3o3P0EL5IV",
    password: "8qvBnvPGDC",
    database: "3o3P0EL5IV"
  });

  var saltCheck = "SELECT Salt FROM Utenti WHERE Username = " + con.escape(user) + "";

  con.connect(function (err) {
    if (err) throw err;
    con.query(saltCheck, function (err, result, fields) {
      if (err) throw err;

      //a2f4154ad98c461261fdd155b93d8c2b13412426fc64a85fe823b9f5608df75a
      if (result[0]) {

        var hashPass = CryptoJS.HmacSHA256(pass, result[0].Salt) + "";

        var sql = "SELECT * FROM Utenti WHERE Username = " + con.escape(user) + " AND Password = '" + hashPass + "'";

        con.query(sql, function (err, result, fields) {
          if (err) throw err;

          if (result[0]) {
            res.set({
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              'Access-Control-Allow-Origin': '*'
            })
            console.log(result);
            res.send({ state: 'ok' });
          } else {
            res.send({ state: 'ko' });
          }
        });
      } else {
        res.send({ state: 'ko' });
      }
    });
  });
});
/*
var sql    = 'SELECT * FROM users WHERE id = ' + connection.escape(userId);
connection.query(sql, function (error, results, fields) {
  if (error) throw error;
  // ...
});
*/


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
