define(['./leaflet', './layer'], function (L, Layer) {

	const { getBaseLayer } = Layer;

	function namespace(selectorName) {
		return `qv-object-olivia-map-${selectorName}`;
	}
	
	const MAP_ID = namespace('map'); 

	function copyToClipboard(data) {
		const json = JSON.stringify({ data });
		navigator.clipboard.writeText(json).then(() => {
			alert('Successfully copied to clipboard');
		});
	}
	
	function getPinIcon() {
		const settings = {
			mapIconUrl: '<svg version="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 149 178"><path fill="{mapIconColor}" stroke="#FFF" stroke-width="6" stroke-miterlimit="10" d="M126 23l-6-6A69 69 0 0 0 74 1a69 69 0 0 0-51 22A70 70 0 0 0 1 74c0 21 7 38 22 52l43 47c6 6 11 6 16 0l48-51c12-13 18-29 18-48 0-20-8-37-22-51z"/><circle fill="{mapIconColorInnerCircle}" cx="74" cy="75" r="61"/><circle fill="#FFF" cx="74" cy="75" r="{pinInnerCircleRadius}"/></svg>',
			className: 'leaflet-data-marker',
			iconAnchor: [12, 32],
			iconSize: [25, 30],
			popupAnchor: [0, -28],
			mapIconColor: '#cc756b',
			mapIconColorInnerCircle: '#fff',
			pinInnerCircleRadius: 48
		};
		
		return L.divIcon({
			html: L.Util.template(settings.mapIconUrl, settings),
			...settings
		});
	}
	
	function getPinMarker(position) {
		return pinMarker = L.marker(
			[position.lat, position.lng],
			{ draggable: true }
		).setIcon(getPinIcon())
			.bindPopup('');
	}
	
	function getLatLngFromApp(layout) {
		let { latitude, longitude } = layout;
		latitude = parseFloat(latitude);
		longitude = parseFloat(longitude);
		
		return { lat: latitude, lng: longitude};
	}
	
				
	function getMap(startPosition, layout) {
		const baseLayer = getBaseLayer(layout);

		const options = baseLayer.crs ? { crs: baseLayer.crs } : {};

		const map = L.map(MAP_ID, options).setView([startPosition.lat, startPosition.lng], 4);
		baseLayer.create().addTo(map);

		return map;
	}
	
	const CRS_OPTIONS = {
		'Default': undefined,
		'EPSG3395': L.CRS.EPSG3395,
		'EPSG3857': L.CRS.EPSG3857,
		'EPSG4326': L.CRS.EPSG4326,
	};
	
	function getCRS(crsOption) {
		return CRS_OPTIONS[crsOption];
	}

	return {
		copyToClipboard,
		namespace,
		MAP_ID,
		getPinMarker,
		getLatLngFromApp,
		getMap,
		CRS_OPTIONS,
		getCRS,
	}
});