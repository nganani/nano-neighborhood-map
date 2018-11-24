'use strict';

var myList = [
	{
		id: 'ChIJm7KexJJ444kRvVjvS_Q7bnw',
		lat: 42.323422,
		long: -71.166448
	},
	{
		id: 'ChIJwWXyFZF444kR-Pdukh5dfiY',
		lat: 42.322237,
		long: -71.170444
	},
	{
		id: 'ChIJ65MfrpJ444kRNIONzDJZO_Q',
		lat: 42.323642,
		long: -71.166325
	},
	{
		id: 'ChIJGYFYy5Z444kRTiXwlplZ0yM',
		lat: 42.320943,
		long:-71.1768324
	},
	{
		id: 'ChIJWy0djZJ444kRDjP5d9jxwRo',
		lat: 42.322240,
		long:-71.1706563
	},
	{
		id: 'ChIJbfMxw5J444kR8PL-6l-SL6c',
		lat: 42.323395,
		long: -71.1666708
	},
	{
		id: 'ChIJ80B_tpJ444kRjQQfz2GvyQc',
		lat: 42.322678,
		long: -71.1690571
	},
	{
		id: 'ChIJw-3qvpJ444kRK9qbwuxAGTE',
		lat: 42.322603,
		long: -71.169676
	},
	{
		id: 'ChIJcz5Dz5l444kRyXP8jd6ymV8',
		lat: 42.31914,
		long: -71.177852
	},
	{
		id: 'ChIJB-NWb5d444kRZ_LBLw0QtPI',
		lat: 42.321125,
		long: -71.1753655
	}

];

// Declaring global variables now to satisfy strict mode
var map;
var service;
var openNow;
var priceLevel;
var clientID;
var clientSecret;

var Location = function(data) {
	var self = this;
	this.name = data.name;
	this.id = data.id;
	this.lat = data.lat;
	this.long = data.long;
	this.url = "";
	this.vicinity = "";
	this.priceLevel = "";
	this.openNow = "";

	this.visible = ko.observable(true);	

	service.getDetails({
		placeId: self.id
	  }, function(place, status) {
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			self.name = place.name;
			self.openNow = (place.opening_hours.open_now) ? 'Yes' : 'No';
			self.priceLevel = (place.price_level) ? place.price_level + ' of 4' : 'No data';
			self.url = place.website;
			self.vicinity = place.vicinity;
			self.rating = place.rating + ' of 5 stars';			
		}
	  });

	this.infoWindow = new google.maps.InfoWindow({content: self.contentString});

	this.marker = new google.maps.Marker({
			position: new google.maps.LatLng(data.lat, data.long),
			map: map,
			title: data.name
	});

	this.showMarker = ko.computed(function() {
		if(this.visible() === true) {
			this.marker.setMap(map);
		} else {
			this.marker.setMap(null);
		}
		return true;
	}, this);

	this.marker.addListener('click', function(){
		self.contentString = '<div class="info-window-content"><div class="title"><b>' + self.name + "</b></div>" +			
			'<div class="content"> Vicinity: ' + self.vicinity + '</div>' +
			'<div class="content"> Rating: ' + self.rating + '</div>' +
			'<div class="content"> Price level: ' + self.priceLevel + '</div>' +
			'<div class="content"> Open now: ' + self.openNow + '</div>' +	
			'<div class="content"><a href="' + self.url +'" target="_blank">' + "Web site</a></div>" +		
			'</div></div>';				

        self.infoWindow.setContent(self.contentString);

		self.infoWindow.open(map, this);

		self.marker.setAnimation(google.maps.Animation.BOUNCE);
      	setTimeout(function() {
      		self.marker.setAnimation(null);
     	}, 2100);
	});

	this.bounce = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};
};

function AppViewModel() {
	var self = this;
	var myPlace = {lat: 42.3231986, lng: -71.1773658};  // Brookline, MA

	this.searchInput = ko.observable("");
	this.myPlaces = ko.observableArray([]);

	map = new google.maps.Map(document.getElementById('map'), {
			zoom: 16,
			center: myPlace
	});
	service = new google.maps.places.PlacesService(map);	

	myList.forEach(function(locationItem){
		self.myPlaces.push( new Location(locationItem));
	});

	this.filteredList = ko.computed( function() {
		var filter = self.searchInput().toLowerCase();
		if (!filter) {
			self.myPlaces().forEach(function(locationItem){
				locationItem.visible(true);
			});
			return self.myPlaces();
		} else {
			return ko.utils.arrayFilter(self.myPlaces(), function(locationItem) {
				var string = locationItem.name.toLowerCase();
				var result = (string.search(filter) >= 0);
				locationItem.visible(result);
				return result;
			});
		}
	}, self);

	this.mapElem = document.getElementById('map');
	this.mapElem.style.height = window.innerHeight - 50;
}

function startApp() {
	ko.applyBindings(new AppViewModel());
}

function errorHandling() {
	alert("Google Maps has failed to load. Please check your internet connection and try again.");
}
