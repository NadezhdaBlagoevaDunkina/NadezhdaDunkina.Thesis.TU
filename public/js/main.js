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
    out += '<div style="width: 350px; height: 500px; float: left; margin-left: 10px; margin-bottom: 7%;">';
    out += '<h1>' + arr[i].name + '</h1>';
    // na h1 style="height: 35px;" 
    out += '<a href="additionalDestinationsInfo.html?destination_id=' + arr[i].id + '"><img src="' + arr[i].mainPhoto + '" style="width:350px; height:250px;"></a>';
    out += '<h3 style="font-size:14px;">' + arr[i].additionalInfo + '</h3>' + '</div>';
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
  out += '<div style="width: 350px; height: 500px; float: left; margin-left: 10px; margin-bottom: 70%;">';
  var i;
  for (i = 0; i < destination.photos.length; i++) {
    out += '<img style="width:350px; height:250px; margin-top: 15px;" src="' + destination.photos[i].filename + '">';
  }
  out += '<h3 style="font-size:14px;">' + destination.history + '</h3>';
  out += '<h3 style="font-size:14px;">' + destination.interestingfacts + '</h3>';
  out += '<h4 style="font-size:14px;">' + destination.timeopen + '</h4>' + '</div>';
  document.getElementById("additionalDestinationInfo").innerHTML = out;
}



function additionalInfo(arr) {
  var out = "";
  var i;
  for (i = 0; i < arr.length; i++) {
    out += '<div style="width:350px; float: left; margin-left: 10px; margin-bottom: 7%;">';
    out += '<img src="' + arr[i].mainPhoto + '" style="width:350px; height:250px;">';
    out += '<p>' + arr[i].history + '</p>';
    out += '<p style="font-size:14px;">' + arr[i].interestingfacts + '</p>';
    out += '<p style="font-size:14px;">' + arr[i].timeopen + '</p>' + '</div>';
  }
  document.getElementById("additionalDestinationInfo").innerHTML = out;
}



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
    out += '<input type="checkbox" value="' + arr[i].id + '"class="destinationCheckbox">' + arr[i].name + '<br>';
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
  xhttp.send('{"ids":[' + checkedValues + ']}');

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
  for (var i = 0; i < destinationsArr.length; i++) {
    var coordinate = new google.maps.LatLng(destinationsArr[i].latitude, destinationsArr[i].longtitude);
    tourGuideCoordinates.push({ location: coordinate, stopover: true });
  }

  directionsService.route({
    origin: new google.maps.LatLng(destinationsArr[0].latitude, destinationsArr[0].longtitude),
    destination: new google.maps.LatLng(destinationsArr[destinationsArr.length - 1].latitude, destinationsArr[destinationsArr.length - 1].longtitude),
    waypoints: tourGuideCoordinates,
    optimizeWaypoints: true,
    travelMode: 'WALKING'
  },
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
    var marker = new google.maps.Marker({ position: { lat: destinationsArr[i].latitude, lng: destinationsArr[i].longtitude }, label: letter, map: map });

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
          console.log(parseJson.message);
        } else {
          console.log(parseJson.message);
        }
      }
    }

    xhttp.open("POST", "/registerUser", true);
    xhttp.setRequestHeader('Content-type', 'application/json');

    // console.log('{username:"' + userName.value + '", email:"' + email.value + '", password:"' + passText + '", repeatPassword:"' + repeatPassText + '"}');

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
}

function loadScript() {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "http://maps.googleapis.com/maps/api/js?key=AIzaSyDlc8Dwnj_i2oKm5ohMSFd6d7WQE_x9BDM&sensor=false&callback=initialize";
  document.body.appendChild(script);
}

window.onload = loadScript;



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
//         //s for minavash prez vsichki izrani destinacii i slagash markeri pokazano na 
//         //https://developers.google.com/maps/documentation/javascript/examples/directions-complex
//         //method showSteps
//         directionsDisplay.setDirections(response);
//       } else {
//         window.alert('Directions request failed due to ' + status);
//       }
//     }
//   );
// }