// ==UserScript==
// @name        SimBuddy Route Distance and Map [SBRTM]
// @namespace   asmdk
// @description route distance
// @include     https://www.simbuddy.com/app/index.php*
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @version     1.0
// @grant       none
// @author		asmdk
// ==/UserScript==
(function() {

	var root = typeof unsafeWindow != 'undefined' ? unsafeWindow : window;

	var Distance = function() {
        this.flights = {};
        this.activeFlightNumber = 0;
		this.init();
	}

	Distance.prototype = {

		init: function() {
			var me = this;
		},
        //preprocessing all the flights on flight page
		processFlightListItem: function(button) {
            var me = this;
            var routeDistSpan = root.document.createElement('span');
            var routeDistText = root.document.createTextNode('');
            routeDistSpan.style = 'font-weight: bold';
            routeDistSpan.appendChild(routeDistText);
            button.addEventListener('click', function() { me.setActiveFlightNumber(me, this) }, false);
            button.parentNode.parentNode.childNodes[11].appendChild(routeDistSpan);
            var flightNuber = me.getFlightNumber(button.getAttribute('onclick'));
            me.calculateRoutesAndDistances(flightNuber, routeDistSpan);
		},
        //adding a distance to athe flight on flight page
        addDistanceForFlightRow: function(routeDistSpan, flightNuber) {
            var me = this,
                flightData = me.flights[flightNuber];
            if (flightData) {
                routeDistSpan.innerText = Math.round(flightData.distance/1000) + 'k/' + Math.round(flightData.distance/1000/1.60934) + 'm';
            }
        },
        //getting routes for a flight and calculate distance
        calculateRoutesAndDistances: function(id, routeDistSpan) {
            var me = this;
			jQuery.get('https://www.simbuddy.com/app/get_flightRouteData.php?id='+id+'&viewType=va', function(stringRoutes, status) {
                var routesArray = stringRoutes.split('|'),
                    routes = [],
                    fullDistance = 0;
                ;

                routesArray.forEach(function(item, index) {
                   if (item.indexOf(',') !== -1) {
                        routes.push(item.split(','));
                    }
                });

                routes.forEach(function(item, index) {
                    var distance = 0;
                    if (index != 0) {
                        distance = me.calculateTheDistance(routes[index-1][0], routes[index-1][1], item[0], item[1]);
                        fullDistance += distance;
                    }
                });
                me.flights[id] = {
                    distance: fullDistance,
                    routes: routes
                };
            })
            .done(function() {
                me.addDistanceForFlightRow(routeDistSpan, id);
            })
            ;
		},
        //returning a flight number by text
        getFlightNumber: function(text) {
            var regex = /\d+/g,
                found = text.match(regex);
            return found[0];
        },
        //setting active flight number in object value
        setActiveFlightNumber: function(me, button) {
            me.activeFlightNumber = me.getFlightNumber(button.getAttribute('onclick'));
        },
        //addinga a flight distance on details flight page
        showFlightDistance: function(element) {
            var me = this,
                currentFlight = me.flights[me.activeFlightNumber];
            var distTr = root.document.createElement('tr'),
                distTdCap = root.document.createElement('td'),
                distTdVal = root.document.createElement('td'),
                distTdCapVal = root.document.createTextNode("Distance"),
                distTdValVal = root.document.createTextNode( Math.round(currentFlight.distance/1000) + 'km/' + Math.round(currentFlight.distance/1000/1.60934) + 'ml');
            distTdCap.appendChild(distTdCapVal);
            distTdVal.appendChild(distTdValVal);
            distTr.appendChild(distTdCap);
            distTr.appendChild(distTdVal);
            element.appendChild(distTr);
        },
        calculateTheDistance: function(latA, lngA, latB, lngB) {
            const EARTH_RADIUS = 6372795;

            var lat1 = latA * Math.PI / 180,
                lat2 = latB * Math.PI / 180,
                long1 = lngA * Math.PI / 180,
                long2 = lngB * Math.PI / 180;

            var cl1 = Math.cos(lat1),
                cl2 = Math.cos(lat2),
                sl1 = Math.sin(lat1),
                sl2 = Math.sin(lat2),
                delta = long2 - long1,
                cdelta = Math.cos(delta),
                sdelta = Math.sin(delta);

            var y = Math.sqrt(Math.pow(cl2 * sdelta, 2) + Math.pow(cl1 * sl2 - sl1 * cl2 * cdelta, 2)),
                x = sl1 * sl2 + cl1 * cl2 * cdelta;

            var ad = Math.atan2(y, x),
                dist = ad * EARTH_RADIUS;

            return dist;
        },
        //adding the buttob to show map
        addMapButton: function(element) {
            var me = this,
             button = root.document.createElement('a');
            button.innerText = 'flight map';
            button.target = '_blank';
            button.className = 'btn btn-success';
            button.href = 'http://dev.loc/maps/ymap_dist.php?routes=' + JSON.stringify(me.flights[me.activeFlightNumber].routes) || '';
            button.addEventListener('click', function() { }, false);
            element.appendChild(button);
        }
	}

	if (root.location.href.indexOf('www.simbuddy.com')>=0) {
        console.log('run simbuddy distance script');
        var oDistance = new Distance();
        //adding on the flight company page for each item
        waitForKeyElements ("input[name='btn_va_details']", function(jNode) {
            oDistance.processFlightListItem(jNode[0]);
        });
        //adding on the flight pilot detail page
        waitForKeyElements ("input[name='btn_va_flightDataList_back_fly_view_pilots']", function(jNode) {
            oDistance.addMapButton(jNode[0].parentNode);
            oDistance.showFlightDistance(jNode[0].parentNode.parentNode.parentNode.childNodes[13].childNodes[1].childNodes[0].childNodes[1]);
        });
        //adding on the flight company detail page
        waitForKeyElements ("#btn_va_flightDataList_back_fly_view_flights", function(jNode) {
            oDistance.addMapButton(jNode[0].parentNode);
        });
	}


})();