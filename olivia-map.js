define([
    'qlik',
    'text!./template.html',
    './properties',
    './leaflet',
    './layer',
    './utils',
    'css!./styles.css',
    'css!./leaflet.css',
],
    function (
        qlik,
        template,
        properties,
        L,
        Layers,
        Util,
    ) {
        return {
            definition: properties,
            initialProperties: {
                latitude: {},
                longitude: {},
            },
            template: template,
            support: {
                snapshot: true,
                export: true,
                exportData: true
            },
            paint: function () {
                return qlik.Promise.resolve();
            },
            controller: ['$scope', function ($scope) {
                const { getMap, getPinMarker, getLatLngFromApp } = Util;
                const { getBaseLayer } = Layers;
				
				$scope.hi = function () {
					let msg = $scope.layout?.baseLayer?.refresh || 'n/a';
					alert(msg);
				}

                try {
                    const app = qlik.currApp();

					const position = getLatLngFromApp($scope.layout);
					let map = getMap(position, $scope.layout);
                    let pin = getPinMarker(position).addTo(map);

                    function setLatLngInApp(lat, lng) {
                        const { latitudeVariable, longitudeVariable } = $scope.layout.appVariables;
                        latitudeVariable && app.variable.setNumValue(latitudeVariable, lat);
                        longitudeVariable && app.variable.setNumValue(longitudeVariable, lng);
                    }

                    function updatePinPopup() {
                        pin.setPopupContent(`${pin.getLatLng()}`);
                    }

                    function changePinLocation(lat, lng) {
                        pin.setLatLng([lat, lng]);
                        updatePinPopup()
                        setLatLngInApp(lat, lng);
                    }

                    map.on('click', function (evt) {
						let position = evt.latlng;
						if (position.lat < -90 || position.lat > 90 || position.lng < -180 || position.lng > 180) {
							position = position.wrap();
						}
                        changePinLocation(position.lat, position.lng);
                    });

                    pin.on('dragend', function () {
                        changePinLocation(pin.getLatLng().lat, pin.getLatLng().lng);
                    });

                    pin.on('mouseover', function () {
                        updatePinPopup();
                    });
                } catch (e) {
                    alert(e);
                }
            }]
        };
    });