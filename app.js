//Lets require/import the HTTP module
var http = require('http');
var express = require('express');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var app = express();
var tsp = require('./tsp'); //tsp e lokalen fail, zatova ima ./
var bodyParser = require('body-parser');
var db_layer = require('./db_layer.js'); //db_layer.js e lokalen fail
var passport = require('passport');
var file = require('file-system');
var fs = require('fs');
var busboy = require('connect-busboy');
app.use(busboy()); 
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.cookieParser());
app.use(express.session({
  secret: "cookie_secret",
  name: "cookie_name"
}));
app.use(app.router);
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
  // var desiredDestinations = [{"name":"ndk", "latitude":23.1234, "longitude":42.4321},
  //     {"name":"kopitoto", "latitude":23.4321, "longitude":43.1234},
  //     {"name":"nim", "latitude":23.5678, "longitude":42.8765}];//TODO get this from request
  var latitude = req.body.latitude;
  var longitude = req.body.longitude;
  var desiredDestinations = [];

  var currDestination = {
    name: "Current Position",
    latitude: latitude,
    longitude: longitude
  };
  desiredDestinations.push(currDestination);


  if (req.body.ids.length === 0) {
    res.send({ destinations: [] });
    return;
  }
  connection.query(
    // destination trqbva da e jelanite ot potrebitelq destinacii
    // toest trqbva da se promeni zaqvkata
    // zaqvkata e promenena

    'select destinations.name, destinations.latitude, destinations.longitude from destinations ' +
    'where id IN (' + req.body.ids + ')',
    function (err, rows) {
      if (err) throw err;
      // console.log(rows);
      //var desiredDestinations = [];
      // arr[0] e current poziciqta na turista

      for (var i in rows) {
        var destination = {
          name: rows[i].name,
          latitude: rows[i].latitude,
          longitude: rows[i].longitude
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




//   var desiredDestinations = [{"name":"ndk", "latitude":0, "longitude":0},
//       {"name":"kopitoto", "latitude":0, "longitude":30},
//       {"name":"nim", "latitude":40, "longitude":0},
//       {"name":"asdf", "latitude":40, "longitude":30},
//       {"name":"qwe", "latitude":30, "longitude":40}];//TODO get this from request
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


// registration

sha256 = require('js-sha256');

app.post('/registerUser',
  function (req, res) {
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
        message: "Неуспешна регистрация."
      };
      res.send(jsonResult);
    }
  });

// login

passport.serializeUser(function (user, done) {
  console.log('serialize user ' + user.username);
  done(null, user.username);
});

passport.deserializeUser(function (username, done) {
  console.log('deserialize user ' + username);
  db_layer.getUser(username, connection, function (user) {
    if (user == null) {
      return done(null, false);
    } else {
      return done(null, { id: user.id, username: user.username });
    }
  });
});

var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function (username, password, done) {
    //function () e callback
    db_layer.getUser(username, connection, function (user) {
      if (user == null) {
        return done(null, false);
      } else {
        password = password + user.salt;
        password = sha256(password);
        if (password == user.password) {
          return done(null, { id: user.id, username: user.username });
        } else {
          return done(null, false);
        }
      }
    });
  }
));


app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/chooseDestinations.html',
    failureRedirect: '/login.html',
    failureFlash: true
  })
);



app.get('/logout', function (req, res) {
  // destroy the user's session to log them out                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
  // will be re-created next request                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
  req.session.destroy(function () {
    res.redirect('/index.html');
  });
});

app.post('/insertDestination', function (req, res) {
  var username = req.session.passport.user;
  var name = req.body.name;
  var longitude = req.body.longitude;
  var latitude = req.body.latitude;
  var timeopen = req.body.timeopen;
  var history = req.body.history;
  var interestingfacts = req.body.interestingfacts;
  var info = req.body.info;
  db_layer.getUser(username, connection, function (user) {
    if (user == null || !user.isadmin) {
      res.redirect('/index.html'); //nqkakva geshka; stranica, v koqto da izpishe, che ne si admin i nqmash prava za dobavqne na destinaciq
    } else {
      connection.query(
        'insert into destinations (destinations.name, destinations.longitude, destinations.latitude, destinations.timeopen, destinations.history, destinations.interestingfacts, destinations.info) ' + //fix query
        'values ("' + name + '", "' + longitude + '", "' + latitude + '", "' + timeopen + '", "' + history + '", "' + interestingfacts + '", "' + info + '")',
        function (err, rows) {
          if (err) throw err;
          res.redirect('/chooseDestinations.html'); //onova s destinaciite
        });
    }
  });
});


// Admin or user

app.post('/getUserInfo', function (req, res) {
  if (req.session.passport == undefined) {
    res.send({}); //ako e undefined, to vrushta prazen json obekt {}
    return;
  }
  var username = req.session.passport.user;
  db_layer.getUser(username, connection, function (user) {
    // if (user == null || !user.isadmin) {
    //   res.redirect('/index.html');
    // var users = [];
    var userInfo = {
      id: user.id,
      username: user.username,
      email: user.email,
      isadmin: user.isadmin
    };
    // users.push(user);
    var jsonResult = {
      // ime na propurti -> stoinost
      user: userInfo
    };
    res.send(jsonResult);
  });
});


app.listen(PORT);



// var image = {
//   displayImage: {
//     size: 11885,
//     path: '/img',
//     name: 'avatar.png',
//     type: 'image/png',
//     _writeStream: {
//       path: '/img',
//       fd: 14,
//       writable: false,
//       flags: 'w',
//       encoding: 'binary',
//       mode: 438,
//       bytesWritten: 11885,
//       busy: false,
//       _queue: [],
//       drainable: true
//     },
//     length: [Getter],
//     filename: [Getter],
//     mime: [Getter]
//   }
// }

app.post('/uploadFile', function (req, res) {

 var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename); 
        fstream = fs.createWriteStream(__dirname + '/public/img/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            res.redirect('back');
        });
    });

  // fs.readFile(req.files.displayImage.path, function (err, data) {
  //   // ...
  //   var newPath = __dirname + "/img/" + req.files.displayImage.name;
  //   fs.writeFile(newPath, data, function (err) {
  //     res.redirect("back");
  //   });
  // });
});


