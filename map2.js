if (!('filter' in Array.prototype)) {
    Array.prototype.filter= function(filter, that /*opt*/) {
        var other= [], v;
        for (var i=0, n= this.length; i<n; i++)
            if (i in this && filter.call(that, v= this[i], i, this))
                other.push(v);
        return other;
    };
}

var map;

// This is the data that's grabbed by AJAX after the page load, my thought is for it to run asynchronisely to speed up load time.
// ALSO if the points were too cumbersome, I know a Zip Code proximity search PHP function so we could call a area-specific JSON file that's built by PHP
var data = [];
// Once a Marker's dropped, I pop it out of data and place it in shown. Eventually I'd like to add a list (somewhere) showing descending list of boxes by proximity
var shown = [];
var boot = [];

// This is the info window, my thought was to have it load early and have each time it's called to just change the inner text
var infowindow = new google.maps.InfoWindow();

// I prevent the pin drop at pulled out elevations (they start coming in around 9 I think.
// But the search function will zoom to a location (at 14) and keep pulling out until there are more than 4 points in the view
// So the pinns will drop no matter what once a search has been executed. Probably should set a max Zoom after this to prevent people from pulling all the way out (pretty slow)
var first_search = false;

// 

// I use this to restrict searches inside of the State of Oregon, it's a rough estimate. 
// I'm think of also restricting scrolling outside of it too
var oregon = new google.maps.Rectangle();
oregon.setBounds( new google.maps.LatLngBounds( new google.maps.LatLng(42.00,-124.57), new google.maps.LatLng(46.32,-116.39) ) )

// This marker notes where a search or geolocation's been placed, will move it around
var marker = null;

// These are yours, I'm assuming for location stuff
var initialLocation;
var browserSupportFlag =  new Boolean();

  
function initialize() {

	var myOptions = {
		zoom: 7,
		minZoom: 7,
		center: new google.maps.LatLng('44.12290742549391', '-120.37421875000001'),
		zoomControl: true,
		disableDefaultUI: true,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

	// Try W3C Geolocation method (Preferred)
	  if(navigator.geolocation) {
		browserSupportFlag = true;
		navigator.geolocation.getCurrentPosition(function(position) {
			initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
			goToThere(initialLocation);
		}, function() {
			handleNoGeolocation(browserSupportFlag);
		});
	} else if (google.gears) {
		// Try Google Gears Geolocation
		browserSupportFlag = true;
		var geo = google.gears.factory.create('beta.geolocation');
		geo.getCurrentPosition(function(position) {
			initialLocation = new google.maps.LatLng(position.latitude,position.longitude);
			contentString = "Location found using Google Gears";
			goToThere(initialLocation);
		}, function() {
		  handleNoGeolocation(browserSupportFlag);
		});
	} else {
		// Browser doesn't support Geolocation
		browserSupportFlag = false;
		handleNoGeolocation(browserSupportFlag);
	}

// Not sure what this is
	var markers = [];

	google.maps.event.addListener(map, 'idle', function() {
		// Prevents there from being drops initially as it gets sort of slow
		if (map.getZoom() > 10 || first_search ) {
			var search = [];
			boot = [];
			//checking to see if any points in this view 
			search = data.filter( function(element, index, array) { 
				var myLatLng = new google.maps.LatLng(element.Lat,element.Long); 
				if( map.getBounds().contains(myLatLng)  ) {
					boot[boot.length] = index;
					return true;
				}
			});
			if( search.length > 0 ) {
				// Dropping the results
				var n = 0;
				$(search).each( function() { 
					shown[shown.length] = this;
					data.splice(boot[n]-n,1);
					n++;
					var myLatLng = new google.maps.LatLng(this.Lat,this.Long);
					var content = '<h2>'+this.Address+'</h2>';
					$(this.locations).each( function() {
						content += '<p>';
						if( this.Description !== undefined ) content += this.Description+'</br>';
						if( this.Hours  !== undefined ) content += '<em>Hours:</em> '+this.Hours;
						content += '</p>';
					});
					var box = new google.maps.Marker({
						position: myLatLng,
						map: map,
						title: this.Address,
					description: '<div id="content">'+content+'</div><span class="report" title="Click to let us know" box="'+this.box+'">Something Wrong?</span>',
						animation: google.maps.Animation.DROP
					});
					// Adds an event listener once the item is dropped
					google.maps.event.addListener(box, 'click', function() {
						infowindow.close();
						infowindow.setContent(this.description);
						infowindow.open(map,box);
					});
				});
			}
		}
	});
}
 
function handleNoGeolocation(errorFlag) {
	initialLocation = new google.maps.LatLng('44.12290742549391', '-120.37421875000001');
		map.setZoom(6);
	map.setCenter(initialLocation);
}
// This function will check and see what points are in the view area, zoom out until there are at least 4
// Will also set that a search has been made and we should start filling in points
function goToThere(location) {
	if( oregon.getBounds().contains(location) ) {
		first_search = true;
		// Places the marker, if the marker's already been placed then will move it
		if( marker != null ) {
			marker.setPosition(location);
		} else {
			marker = new google.maps.Marker({
				icon: 'you.png',
				map: map, 
				position: location
			});
		}

		//Creates a temporary hidden map to test and see whether anything's going to show up
		var temp_map = map;
		map.setCenter(location);


		//Searches both the shown and data arrays, these are temporary arrays to hold the results
		search_data = new Array;
		search_shown = new Array;
		var i = -1;
		while( search_data.length + search_shown.length < 4 && i < 6 ) {
			i++;
			temp_map.setZoom(14-i);

			//First filters the points that aren't printed for the new view
			search_data = data.filter( function(element, index, array) { 
				var myLatLng = new google.maps.LatLng(element.Lat,element.Long); 
				return map.getBounds().contains(myLatLng);
			});

			//Then filters the points that are already printed to see if they're in the new view
			search_shown = shown.filter( function(element, index, array) { 
				var myLatLng = new google.maps.LatLng(element.Lat,element.Long); 
				return map.getBounds().contains(myLatLng);
			});
		}
		map.setZoom(14-i);
		map.setCenter(location);

		//Sorting the results based on proximity using http://www.meridianworlddata.com/Distance-Calculation.asp equation
		shown.sort( function(a,b) {
			var adist = Math.sqrt(Math.pow(69.1*(a.Lat-marker.position.Ia),2)+Math.pow(69.1*(a.Long-marker.position.Ja)*Math.cos(marker.position.Ia/57.3),2))
			var bdist = Math.sqrt(Math.pow(69.1*(b.Lat-marker.position.Ia),2)+Math.pow(69.1*(b.Long-marker.position.Ja)*Math.cos(marker.position.Ia/57.3),2))
			return adist-bdist;
		});
	} else {
		alert('That doesn\'t appear to be in Oregon, sport');
	}
}

(function($){

// The form submit
	$.fn.searchify = function() {
		if( this.is('form') ) {
			this.submit( function(e) {
				e.preventDefault();
				var address = $(this).find('input[name=address]').val();
				if( address.length == 0 ) return false;
				if( address.search('Oregon') < 0 && address.search('OR') < 0 && address.search('or') < 0 && address.search('oregon') < 0 ) {
					if( address.toLowerCase() == 'washington' ) address += ' County';
					if( address.toLowerCase() == 'baker' ) address += ' County';
					if( address.toLowerCase() == 'clatsup' ) address += ' County';
					if( address.toLowerCase() == 'benton' ) address += ' County';
					if( address.toLowerCase() == 'union' ) address += ' County';
					if( address.toLowerCase() == 'yamhill' ) address += ' County';
					if( address.toLowerCase() == 'wasco' ) address += ' County';
					if( address.toLowerCase() == 'wheeler' ) address += ' County';
					if( address.toLowerCase() == 'morrow' ) address += ' County';
					if( address.toLowerCase() == 'polk' ) address += ' County';
					if( address.toLowerCase() == 'sherman' ) address += ' County';
					if( address.toLowerCase() == 'malheur' ) address += ' County';
					if( address.toLowerCase() == 'lincoln' ) address += ' County';
					if( address.toLowerCase() == 'linn' ) address += ' County';
					if( address.toLowerCase() == 'lane' ) address += ' County';
					if( address.toLowerCase() == 'lake' ) address += ' County';
					if( address.toLowerCase() == 'josephine' ) address += ' County';
					if( address.toLowerCase() == 'klamath' ) address += ' County';
					if( address.toLowerCase() == 'harney' ) address += ' County';
					if( address.toLowerCase() == 'grant' ) address += ' County';
					if( address.toLowerCase() == 'descutes' ) address += ' County';
					if( address.toLowerCase() == 'coos' ) address += ' County';
					if( address.toLowerCase() == 'crook' ) address += ' County';
					if( address.toLowerCase() == 'curry' ) address += ' County';
					if( address.toLowerCase() == 'columbia' ) address += ' County';
					if( address.toLowerCase() == 'jefferson' ) address += ' County';
					if( address.toLowerCase() == 'jackson' ) address += ' County';
					if( address.toLowerCase() == 'marion' ) address += ' County';
					if( address.toLowerCase() == 'wallowa' ) address += ' County';
					if( address.toLowerCase() == 'klamath' ) address += ' County';
					if( address.toLowerCase() == 'multnomah' ) address += ' County';
					address += ' Oregon';
				}
				var geocode = new google.maps.Geocoder();
				geocode.geocode( 
					{'address': address}, 
					function(results, status) {
						mylocation = results;
						if (status == google.maps.GeocoderStatus.OK ) {
							goToThere(results[0].geometry.location);
							$('form input[name=address]').blur();
						} else {
							alert("Geocode was not successful for the following reason: " + status);
						}
					}
				);
			});
		}
		
		return this;
	}

	$.fn.bettersubmit = function() {
	if( $(this).is('form') ) {
			$.getJSON(
				'boxes.php?'+$(this).serialize(),
				function(json) {
					response = json;
				}
			);

			$('input[name=email]:first').val($(this).find('input[name=email]').val())
			$('input[name=name]:first').val($(this).find('input[name=name]').val())
			Shadowbox.close();
			$('#problem').find('input[type=hidden]:not("[name=problem]")').val('');
			$('#problem').find('textarea').text('');
			$('span.report').removeClass('report').addClass('done').text('Thanks for the tip, we\'ll get right on it');
	}
		return this;
	}

	$.fn.loadpoints = function() {
		$.getJSON(
			'boxes.php',
			function(json) {
				data = json;
			}
		);
		return this;
	}

	// Loads everything we need
	$.fn.loadme = function() {
		this.ready( function(e) {
			initialize();
			$().loadpoints();
			$('#search').searchify();
			$('#search').html5form();
			$('#problem').html5form();
			$('.report').live('click',function() {
				$('input[name=box]').val($(this).attr('box'));
				$('input[name=field]').val('Notes');
				$('textarea[name=msg]').text('There\'s a problem with the Ballot Box at '+$('span.report').prev('div').find('h2').text());
				$('a[href=#report-problem]').click();
			});
		});
		Shadowbox.init();
		return this;
	}

})(jQuery);
$(document).loadme();