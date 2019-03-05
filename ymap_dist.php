<html>
	<head>
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
		<script src="https://api-maps.yandex.ru/2.1/?apikey=f5917908-1f2a-4b40-abf2-f1bbf3f7934b&lang=ru_RU" type="text/javascript"></script>
		
		<style>
			html,
			body,
			#map {
			  height: 500px;
			  width: 500px;
			  margin: 0px;
			  padding: 0px
			}
		</style>
		<script>
			let jsonRoutes = '<?php echo $_REQUEST['routes'] ?>',
			routes = JSON.parse(jsonRoutes),
			fullDistance = 0;
			
			let myMap;
			ymaps.ready(init);
			function init() {  
				if (myMap == undefined) {
					myMap = new ymaps.Map("map", {
						center: routes[0],
						zoom: 7
					});
				} else {
					myMap.setCenter(routes[0], 7);
				}

				
				let myPolyline = new ymaps.Polyline(routes, {
						balloonContent: "Polyline"
					}, {
						balloonCloseButton: false,
						// The line color.
						strokeColor: "#000000",
						// Line width.
						strokeWidth: 4,
						// The transparency coefficient.
						strokeOpacity: 0.5
				});
				
				routes.forEach(function(item, index) {
					let distance = 0;
					if (index != 0) {
						distance = ymaps.coordSystem.geo.getDistance(routes[index-1], item);
						fullDistance += distance;
					}
					
					if (index == 0 || index == (routes.length - 1)) {
						myMap.geoObjects.add(new ymaps.Placemark(
						item, {
							iconContent: index == 0 ? 0 : ymaps.formatter.distance(fullDistance)
						}, {
							preset: 'islands#circleIcon'
						}
					));
					}
				});
				 myMap.geoObjects.add(myPolyline);
						
				console.log(fullDistance);
				$('.distanceM span').html(Math.round(fullDistance));
				$('.distanceKm span').html(Math.round(fullDistance/1000));
				$('.distanceMl span').html(Math.round(fullDistance/1000/1.60934));
				
			}
		</script>
	</head>
	<body>
		<div id="map" style="width: 600px; height: 400px"></div>
		<div><button name="clear" onclick="myMap.geoObjects.removeAll()" >clear</button></div>
		<div><button name="clear" onclick="init()" >add</button></div>
		<h2>Distance</h2>
		<div class="distanceM"><span></span> m</div>
		<div class="distanceKm"><span></span> km</div>
		<div class="distanceMl"><span></span> ml</div>
	</body>
</html>