var currPosition;

function drawDestinations() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (xhttp.readyState == 4 && xhttp.status == 200) {

      var myJson = xhttp.responseText;

      var parseJson = JSON.parse(myJson);
      destinationInfo(parseJson.destinations);
    }
  };
  xhttp.open("POST", "/getAllDestinations", true);
  xhttp.send();
}


function destinationInfo(arr) {
  var out = "";
  var i;
  for (i = 0; i < arr.length; i++) {
    out += '<div class="mainImage col-md-6">';
    out += '<h1 id="destinationNameId">' + arr[i].name + '</h1>';
    out += '<a href="additionalDestinationsInfo.html?destination_id=' + arr[i].id + '"><img class="classImages" src="' + arr[i].mainPhoto + '""></a>';
    out += '<h3 class="classAdditionalInfo">' + arr[i].additionalInfo + '</h3>' + '</div>';
  }
  document.getElementById("mainDestinationInfo").innerHTML = out;
}

function destinationsAdditionalInfo() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (xhttp.readyState == 4 && xhttp.status == 200) {

      var myJson = xhttp.responseText;

      var parseJson = JSON.parse(myJson);
      //      console.log(parseJson);
      drawAdditinalInfo(parseJson);
    }
  };
  xhttp.open("POST", "/getAdditionalInfo", true);
  xhttp.setRequestHeader('Content-type', 'application/json');
  xhttp.send('{"id":' + getURLParameter("destination_id") + '}');
}

function drawAdditinalInfo(destination) {
  var out = "";
  out += '<div class="drawAdditionalInfoClass">';
  var i;
  out += '<div class="drawAdditionalInfoClass2">';
  for (i = 0; i < destination.photos.length; i++) {
    out += '<img class="drawAdditInfoImg" src="' + destination.photos[i].filename + '">';
  }
  out += '</div>'
  out += '<p class="classForP">' + destination.history + '</p>';
  out += '<p class="classForP">' + destination.interestingfacts + '</p>';
  out += '<p class="classForP">' + destination.timeopen + '</p>' + '</div>';
  document.getElementById("additionalDestinationInfo").innerHTML = out;
}

function additionalInfo(arr) {
  var out = "";
  var i;
  for (i = 0; i < arr.length; i++) {
    out += '<div class="additionalInfoClass">';
    out += '<img class="mainphotoClass" src="' + arr[i].mainPhoto + '">';
    out += '<p class="classForP">' + arr[i].history + '</p>';
    out += '<p class="classForP">' + arr[i].interestingfacts + '</p>';
    out += '<p class="classForP">' + arr[i].timeopen + '</p>' + '</div>';
  }
  document.getElementById("additionalDestinationInfo").innerHTML = out;
}

// getURLParameter in Javascript
// http://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript
// regex (regular expression)
function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}


// function infoForDestination(){
//   var xhttp = new XMLHttpRequest();
//   xhttp.onreadystatechange = function () {
//     if (xhttp.readyState == 4 && xhttp.status == 200) {

//       var myJson = xhttp.responseText;

//       var parseJson = JSON.parse(myJson);
//       additionalInfo(parseJson.destination);





// }



function chooseDestinations() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (xhttp.readyState == 4 && xhttp.status == 200) {

      var myJson = xhttp.responseText;

      var parseJson = JSON.parse(myJson);
      chooseFromAllDestinations(parseJson.destinations);
    }
  };
  xhttp.open("POST", "/getAllDestinations", true);
  // xhttp.setRequestHeader('Content-type', 'application/json');
  xhttp.send();
}


function chooseFromAllDestinations(arr) {
  var out = "";
  var i;
  for (i = 0; i < arr.length; i++) {
    out += '<label><input type="checkbox" value="' + arr[i].id + '"class="destinationCheckbox">' + arr[i].name + '</label><br>';
  }
  document.getElementById("allDestinations").innerHTML = out;
}


function getRoute() {
  var checkedValues = [];
  var inputElements = document.getElementsByClassName('destinationCheckbox');
  for (var i = 0; inputElements[i]; i++) {
    if (inputElements[i].checked) {
      checkedValues.push(inputElements[i].value);
    }
  }
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (xhttp.readyState == 4 && xhttp.status == 200) {

      var myJson = xhttp.responseText;

      var parseJson = JSON.parse(myJson);
      showRoute(parseJson.destinations);
    }
  };
  xhttp.open("POST", "/getOptimalRoute", true);
  xhttp.setRequestHeader('Content-type', 'application/json');
  //xhttp.send('{"ids":[' + checkedValues + ']}');
  // xhttp.send('{"username":"' + userName.value + '", "email":"' + email.value + '", "password":"' + passText + '", "repeatPassword":"' + repeatPassText + '"}');

  xhttp.send('{"ids":[' + checkedValues + '] , "latitude":"' + currPosition.coords.latitude + '", "longitude":"' + currPosition.coords.longitude + '"}');

  console.log(currPosition);
  console.log(checkedValues);
}






function showRoute(arr) {
  var markerArray = [];

  var mapProp = {
    center: new google.maps.LatLng(42.696552, 23.32601),
    zoom: 11,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer({ map: map });
  var stepDisplay = new google.maps.InfoWindow;

  calculateAndDisplayRoute(directionsDisplay, directionsService, arr, stepDisplay, map, markerArray);
}

function calculateAndDisplayRoute(directionsDisplay, directionsService,
  destinationsArr, stepDisplay, map, markerArray) {

  // First, remove any existing markers from the map.
  for (var i = 0; i < markerArray.length; i++) {
    markerArray[i].setMap(null);
  }

  var tourGuideCoordinates = [];
  // var currPositioncoordinate = new google.maps.LatLng(currPosition.coords.latitude, currPosition.coords.longitude);
  // tourGuideCoordinates.push({ location: currPositioncoordinate, stopover: true });

  for (var i = 0; i < destinationsArr.length; i++) {
    var coordinate = new google.maps.LatLng(destinationsArr[i].latitude, destinationsArr[i].longitude);
    tourGuideCoordinates.push({ location: coordinate, stopover: true });
  }

  directionsService.route({
    origin: new google.maps.LatLng(destinationsArr[0].latitude, destinationsArr[0].longitude),
    destination: new google.maps.LatLng(destinationsArr[destinationsArr.length - 1].latitude, destinationsArr[destinationsArr.length - 1].longitude),
    waypoints: tourGuideCoordinates,
    optimizeWaypoints: true,
    travelMode: 'DRIVING' // WALKING or DRIVING
  },
    //calback - proverqva dali koordinatite sa OK
    function (response, status) {
      // Route the directions and pass the response to a function to create
      // markers for each step.
      if (status === 'OK') {
        directionsDisplay.setDirections(response);
        directionsDisplay.setOptions({ suppressMarkers: true });

        showSteps(destinationsArr, stepDisplay, map, markerArray);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    }
  );

}

function showSteps(destinationsArr, stepDisplay, map, markerArray) {
  // For each step, place a marker, and add the text to the marker's infowindow.
  // Also attach the marker to an array so we can keep track of it and remove it
  // when calculating new routes.
  var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  var myRoute = destinationsArr[0];

  for (var i = 0; i < destinationsArr.length; i++) {
    var letter = labels[i];
    if (typeof destinationsArr[i].latitude === 'string') {
      destinationsArr[i].latitude = parseFloat(destinationsArr[i].latitude);
      console.log(destinationsArr[i]);
    }

    if (typeof destinationsArr[i].longitude === 'string') {
      destinationsArr[i].longitude = parseFloat(destinationsArr[i].longitude);
    }
    var marker = new google.maps.Marker({ position: { lat: destinationsArr[i].latitude, lng: destinationsArr[i].longitude }, label: letter, map: map });

    attachInstructionText(
      stepDisplay, marker, destinationsArr[i].name, map);
  }
}

function attachInstructionText(stepDisplay, marker, text, map) {
  google.maps.event.addListener(marker, 'click', function () {
    // Open an info window when the marker is clicked on, containing the text
    // of the step.
    console.log(text);
    stepDisplay.setContent(text);
    stepDisplay.open(map, marker);
  });
}





function onLoginButtonClick() {
  var userName = document.getElementById("login-username");
  var email = document.getElementById("login-email");
  var password = document.getElementById("login-password");
  var repeatPassword = document.getElementById("login-repeat-password");

  if (userName.checkValidity() == true && email.checkValidity() == true
    && password.checkValidity() == true && repeatPassword.checkValidity() == true) {
    var passText = password.value;
    var repeatPassText = repeatPassword.value;

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (xhttp.readyState == 4 && xhttp.status == 200) {

        var myJson = xhttp.responseText;

        var parseJson = JSON.parse(myJson);

        if (parseJson.isSuccess == true) {
          alert(parseJson.message);
          window.location.replace("login.html");
        } else {
          alert(parseJson.message);
        }
      }
    }

    xhttp.open("POST", "/registerUser", true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send('{"username":"' + userName.value + '", "email":"' + email.value + '", "password":"' + passText + '", "repeatPassword":"' + repeatPassText + '"}');


  }
}


// google map 

function initialize() {
  var mapProp = {
    center: new google.maps.LatLng(42.696552, 23.32601),
    zoom: 11,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  var stepDisplay = new google.maps.InfoWindow;

  directionsDisplay.setMap(map);

  var infoWindow = new google.maps.InfoWindow({ map: map });

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      currPosition = position;
      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found');
      map.setCenter(pos);
    }, function () {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation ti obqsni drugo
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
}

function loadScript() {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "http://maps.googleapis.com/maps/api/js?key=AIzaSyDlc8Dwnj_i2oKm5ohMSFd6d7WQE_x9BDM&sensor=false&callback=initialize";
  document.body.appendChild(script);
}

window.onload = loadScript;



function userInfo() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (xhttp.readyState == 4 && xhttp.status == 200) {

      var myJson = xhttp.responseText;

      var parseJson = JSON.parse(myJson);

      // console.log(parseJson.user.email);
      // ot 340 red app.js 
      // var jsonResult = {
      //   user: userInfo
      // };
      console.log(parseJson.user);

      if (parseJson.user == undefined || parseJson.user.isadmin == 0) { // ne e vlqzul v sistemata ili e vlqzul, no ne e admin, a e potrebitel
        $("#addDestination").hide(); //jQuery
        // css; syshto raboti
        // var div = document.getElementById('addDestination');
        // div.style.visibility = "hidden";
        // div.style.display = "none";
      }
      if (parseJson.user == undefined) { // ne e vlqzul v sistemata
        $("#logoutId").hide(); //jQuery
        $("#choosedestId").hide(); //jQuery
        if (window.location.href == '/chooseDestinations.html') {
          window.location.href = '/index.html';
        }
      } else { //potrebitelqt e vlqzul v sistemata
        $("#loginId").hide(); //jQuery
        $("#regId").hide(); //jQuery
        // $("#choosedestId").show(); //jQuery
        document.getElementById('labelName').innerHTML = 'Здравей, ' + parseJson.user.username + '!';

      }
    }
  }

  xhttp.open("POST", "/getUserInfo", true);
  xhttp.setRequestHeader('Content-type', 'application/json');
  xhttp.send();
}

function onDestinationPageLoad() {
  chooseDestinations();
  userInfo();
  getDestinationImages();
}



function drawImagesFilename(arr) {
  //arr e masivut s imenata na destinaciite - string tip sa imenata
  var out = "";
  var i;
  for (i = 0; i < arr.length; i++) {
    out += '<option value="' + arr[i] + '">' + arr[i] + '</option>';
  }
  document.getElementById("dropdownMenuId").innerHTML = out;
}



function getDestinationImages() {

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    // kato survura vurne otgovor json

    if (xhttp.readyState == 4 && xhttp.status == 200) {

      //vuv var myJson ima string
      var myJson = xhttp.responseText;

      //parseJson veche e parsnat kym json obekt, a ne string
      var parseJson = JSON.parse(myJson);

      drawImagesFilename(parseJson.images);

    }
  };
  xhttp.open("POST", "/getImages", true);
  xhttp.setRequestHeader('Content-type', 'application/json');

  xhttp.send(); //survurut ne ochakva parametri -> send()

}


// function onHeaderLoaded() {
//   console.log("gasgasadasdafsadfsffasfas");
//   var xhttp = new XMLHttpRequest();
//   xhttp.onreadystatechange = function () {
//     // kato survura vurne otgovor json

//     if (xhttp.readyState == 4 && xhttp.status == 200) {
//       var myJson = xhttp.responseText;

//       //parseJson veche e parsnat kym json obekt, a ne string
//       var parseJson = JSON.parse(myJson);
//       if (parseJson.user == undefined) {
//         console.log("Не сте влезли в системата.")
//       }
//       else {
//         console.log(parseJson.user.id);
//       }
//     }
//   };
//   xhttp.open("POST", "/getUserInfo", true);
//   xhttp.setRequestHeader('Content-type', 'application/json');

//   xhttp.send(); //survurut ne ochakva parametri -> send()
// }





// function calculateAndDisplayRoute(directionsService, directionsDisplay) {
//   directionsService.route({
//     //nachalen i kraen element ot izbranite...demek nachalo origin: new google.maps.LatLng(arr[0].latitite, arr[0].langti..);
//     //za destination sashtoto  new google.maps.LatLng(arr[arr.lenght - 1].latitite, arr[arr.lenght - 1].langti..);
//     origin: new google.maps.LatLng(42.696552, 23.32601),
//     destination: new google.maps.LatLng(42.696552, 23.34601),
//     travelMode: 'WALKING'
//   },
//     function (response, status) {
//       if (status === 'OK') {
//         //s for minavash prez vsichki izbrani destinacii i slagash markeri pokazano na 
//         //https://developers.google.com/maps/documentation/javascript/examples/directions-complex
//         //method showSteps
//         directionsDisplay.setDirections(response);
//       } else {
//         window.alert('Directions request failed due to ' + status);
//       }
//     }
//   );
// }

