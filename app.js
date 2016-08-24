//Lets require/import the HTTP module
var http = require('http');
var express = require('express');
var app = express();
var tsp = require('./tsp');
var bodyParser = require('body-parser');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

//Lets define a port we want to listen to
const PORT = 80;


var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'traveldb',
  charset: "utf8",
  port: 3306
});

connection.connect();



app.use(express.static(__dirname + '/public'));

app.post('/getAllDestinations', function (req, res) {
  connection.query(
    'select destinations.name, destinations.id, destinations.info, photos.filename ' +
    'from destinations ' +
    'left join photos ' +
    'on destinations.mainphoto_id=photos.id',
    function (err, rows) {
      if (err) throw err;
      // console.log(rows);
      var destinations = [];
      for (var i in rows) {
        var destination = {
          name: rows[i].name,
          id: rows[i].id,
          additionalInfo: rows[i].info,
          timeOpen: rows[i].timeopen,
          mainPhoto: "img/" + rows[i].filename
        };
        destinations.push(destination);
      }
      var jsonResult = {
        destinations: destinations
      };
      res.send(jsonResult);
    }
  );
});



app.post('/getOptimalRoute', function (req, res) {
  // var desiredDestinations = [{"name":"ndk", "latitude":23.1234, "longtitude":42.4321},
  //     {"name":"kopitoto", "latitude":23.4321, "longtitude":43.1234},
  //     {"name":"nim", "latitude":23.5678, "longtitude":42.8765}];//TODO get this from request

  // console.log(req.body.ids[0]);
  connection.query(
    // destination trqbva da e jelanite ot potrebitelq destinacii
    // toest trqbva da se promeni zaqvkata
    // zaqvkata e promenena

    'select destinations.name, destinations.latitude, destinations.longtitude from destinations ' +
    'where id IN (' + req.body.ids + ')',
    function (err, rows) {
      if (err) throw err;
      // console.log(rows);
      var desiredDestinations = [];
      // arr[0] e current poziciqta na turista
      for (var i in rows) {
        var destination = {
          name: rows[i].name,
          latitude: rows[i].latitude,
          longtitude: rows[i].longtitude
        };
        desiredDestinations.push(destination);
      }
      var tspAlgorithm = tsp.getTspAlgorithm();
      tspAlgorithm.setDestinations(desiredDestinations);
      var orderedDestinations = tspAlgorithm.calculateOptimalRoute();
      console.log(orderedDestinations);
      res.send({ destinations: orderedDestinations });
    }
  );
});




//   var desiredDestinations = [{"name":"ndk", "latitude":0, "longtitude":0},
//       {"name":"kopitoto", "latitude":0, "longtitude":30},
//       {"name":"nim", "latitude":40, "longtitude":0},
//       {"name":"asdf", "latitude":40, "longtitude":30},
//       {"name":"qwe", "latitude":30, "longtitude":40}];//TODO get this from request
//   var tspAlgorithm = tsp.getTspAlgorithm();
//   tspAlgorithm.setDestinations(desiredDestinations);
//   var orderedDestinations = tspAlgorithm.calculateOptimalRoute();
//   res.send(orderedDestinations);
// });



// var destinations = [
//   {     "name": "Try",
//     "bannerImg1": "img/ujenPark.jpg",
//     "additionalInfo": "sadsadadssadsad"
//   },
//   {
//     "name": "Try2",
//     "bannerImg1": "img/ban.jpg",
//     "additionalInfo": "sadsadadssadsad"
//   }
// ];



app.post('/getAdditionalInfo', function (req, res) {
  connection.query(
    'select destinations.mainphoto_id, destinations.history, destinations.interestingfacts, destinations.timeopen ' +
    'from destinations ' +
    'where id=' + req.body.id,
    function (err, rows) {
      if (err) throw err;
      // console.log(rows);
      // var destinations = [];
      // console.log("11111111111");
      // console.log('select * ' +
      //   'from photos ' +
      //   'where destination_id=' + req.body.id);
      connection.query(
        'select * ' +
        'from photos ' +
        'where destination_id=' + req.body.id,
        function (error, imagerows) {
          if (error) throw error;
          var photos = [];
          for (var i in imagerows) {
            var photo = {
              filename: "img/" + imagerows[i].filename
            };
            photos.push(photo);
          }
          var jsonResult = {
            photos: photos,
            history: "История: " + rows[0].history,
            interestingfacts: "Интересни факти: " + rows[0].interestingfacts,
            timeopen: "Работно време: " + rows[0].timeopen
          };
          res.send(jsonResult);
    //      console.log(jsonResult);
        });
      // destinations.push(destination);
    }
  );
});


sha256 = require('js-sha256');

app.post('/registerUser', function (req, res) {
  var userName = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var repeatPassword = req.body.repeatPassword;

  if (password === repeatPassword) {
    // sravnqva parolite
    // generira proizvolen string
    var salt = (Math.random() * 1e32).toString(36);
    //  console.log(salt);
    password = password + salt;
    password = sha256(password);



    connection.query(
      'insert into users (users.username, users.email, users.isadmin, users.password, users.salt) ' +
      'values ("' + userName + '", "' + email + '", false , "' + password + '", "' + salt + '")',
      function (err, rows) {
        if (err) throw err;
        var jsonResult = {
          isSuccess: true,
          message: "Регистрацията е успешна!"
        };
        res.send(jsonResult);
      });
  } else {
    var jsonResult = {
      isSuccess: false,
      message: "Неуспешна регистрация. Паролите не съвпадат. Моля, опитайте отново."
    };
    res.send(jsonResult);
  }
});






app.listen(PORT);