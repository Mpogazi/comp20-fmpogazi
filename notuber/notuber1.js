"use strict";
var myLat = 0;
var myLng = 0;
var myLocation = google.maps.LatLng(myLat, myLng);
var options = {
    zoom: 13,
    center: myLocation,
    mapTypeId: google.maps.MapTypeId.ROADMAP
};
var map;
var hxr;
var infowindow = new google.maps.InfoWindow();
var distanceFromMe = [];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), options);
    getMyLocation();
}

function getMyLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            myLat = position.coords.latitude;
            myLng = position.coords.longitude;
            requestData();
            
        });
    }
}

function requestData() {
    hxr = new XMLHttpRequest();
    var url = "https://jordan-marsh.herokuapp.com/rides";
    var params = "username=DsRILKPCEf&lat="+myLat+"&lng="+myLng;
    
    hxr.open('POST', url, true);
    
    hxr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    
    hxr.onreadystatechange = function() {
        if(hxr.readyState == 4 && hxr.status == 200) {
            var message = JSON.parse(hxr.responseText);
            var key = Object.keys(message)[0];
            var arrayM = message[key];
            var icons = "driver_icon.png";
            if(arrayM == 'passengers') {
                icons = "jumbo_passenger.png";
            }
            var minimum = 13000;
            for(var i = 0; i < arrayM.length; i++) {
                var folkLocation = new google.maps.LatLng(arrayM[i].lat, arrayM[i].lng);
                var distancePerson = google.maps.geometry.spherical.computeDistanceBetween(folkLocation, myLocation) * 0.000621371;
                if(distancePerson < minimum) {
                    if(distanceFromMe.length == 0) {
                        distanceFromMe.push(distancePerson);
                    } else {
                        distanceFromMe.pop();
                        distanceFromMe.push(distancePerson);
                    }
                    minimum = distancePerson;
                }
                makeMarker(folkLocation, icons, map, distancePerson, arrayM[i].username);                
            }
        }
    }
    hxr.send(params);
    myLocation = new google.maps.LatLng(myLat, myLng);
    map.panTo(myLocation);
    var meIcon;
    meIcon = "jerry.png";
    var markMe = new google.maps.Marker({
        position: myLocation,
        title: "Me: DsRILKPCEf",
        icon: meIcon
    });
    markMe.setMap(map);
    google.maps.event.addListener(markMe, 'click', function() {
        if(distanceFromMe.length === 0) {
            infowindow.setContent("DsRILKPCEf" + "Nobody is online");
        } else {
            infowindow.setContent("DsRILKPCEf" + " shortest distance: " + distanceFromMe[0]);
        }
        infowindow.open(map, markMe);
    });
}

function makeMarker(place, icon, map, distance, uname) {
    var markerM = new google.maps.Marker({
        position: place,
        icon: icon,
        title: "username: "+uname+"</br>"+distance+"  miles from Me"
    });
    markerM.setMap(map);
    google.maps.event.addListener(markerM, 'click', function() {
        infowindow.setContent(markerM.title);
        infowindow.open(map, markerM);
    });
}