define(['./leaflet'], function (L) {

	class BaseLayer {
		constructor(id, urlTemplate, crs = undefined, options = {}) {
			this.id = id;
			this.urlTemplate = urlTemplate;
			this.crs = crs; // coordinate reference system. used when the map is created
			this.options = options;
		}
		
		create() {
			return L.tileLayer(this.urlTemplate, this.options)
		}
		
		addOptions(options) {
			this.options = { ...this.options, ...options };
		}
	}
	
	class NGABaseLayer extends BaseLayer {
		constructor(id, urlTemplate, crs=undefined, options={}) {
			super(id, urlTemplate, crs, options);
			this.options = {...this.options, tms: false, tileSize: 256 }; 
		}
	}
	
	class BaseLayers {
		static OPEN_STREET_MAP = new BaseLayer(
			'Open Street Map',
			'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
			undefined,
			{ attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }
		);
		
		/** How to find the CRS of an NGA layer:
		*  1. Go to https://maps.gvs.nga.mil/arcgis/rest/services/
		*  2. Select the layer.
		*  3. Click "Detailed Service Information Document".
		*  4. Search for "CRS" in this document.
		*/
		
		static NGA_WORLD_IMAGERY = new NGABaseLayer(
			'NGA World Imagery', 
			'https://maps.gvs.nga.mil/arcgis/rest/services/Basemap/NGA_World_Imagery_2D/MapServer/tile/{z}/{y}/{x}?blankTile=false.png',
			L.CRS.EPSG4326
		);
		
		static NGA_WORLDWIDE_STREET = new NGABaseLayer(
			'NGA Worldwide Street',
			'https://maps.gvs.nga.mil/arcgis/rest/services/Basemap/World_StreetMap_2D/MapServer/tile/{z}/{y}/{x}?blankTile=false.png',
			L.CRS.EPSG4326
		);
		
		static NGA_SHADED_RELIEF = new NGABaseLayer(
			'NGA Shaded Relief',
			'https://maps.gvs.nga.mil/arcgis/rest/services/Basemap/NGA_ShadedRelief_2D/MapServer/tile/{z}/{y}/{x}?blankTile=false.png',
			L.CRS.EPSG4326

		);
		
		static NGA_HILLSHADE = new NGABaseLayer(
			'NGA Hillshade',
			'https://maps.gvs.nga.mil/arcgis/rest/services/Basemap/NGA_Hillshade_2D/MapServer/tile/{z}/{y}/{x}?blankTile=false.png',
			L.CRS.EPSG4326
		);
		
		static NGA_SLATE = new NGABaseLayer(
			'NGA Slate',
			'https://maps.gvs.nga.mil/arcgis/rest/services/CanvasMaps/Slate/MapServer/tile/{z}/{y}/{x}?blankTile=false.png',
			L.CRS.EPSG4326
		);
		
		static ALL = [
			BaseLayers.OPEN_STREET_MAP,
			BaseLayers.NGA_WORLD_IMAGERY,
			BaseLayers.NGA_WORLDWIDE_STREET,
			BaseLayers.NGA_SHADED_RELIEF,
			BaseLayers.NGA_HILLSHADE,
			BaseLayers.NGA_SLATE,
		];
		
		static CUSTOM_ID = 'Custom';
		
		static IDs = BaseLayers.ALL.map(x => x.id).concat([BaseLayers.CUSTOM_ID]);
	}
	
	/**
	* Creates the map base layer according to configurations set in the properties panel.
	*
	* @param {Object} layout - $scope.layout
	* @returns BaseLayer
	*/
	function getBaseLayer(layout) {
		const id = layout.baseLayer.id;
		let baseLayer;

		let boolOptions = layout?.baseLayer?.options?.bool || {};
		Object.keys(boolOptions).forEach((key) => boolOptions[key] = boolOptions[key] || false );

		if (id === BaseLayers.CUSTOM_ID) {
			const urlTemplate = layout.baseLayer?.customUrl || '';
			if (!urlTemplate) {
				alert('Missing custom url template.');
				return;
			}
			
			
			
			baseLayer = new BaseLayer(BaseLayers.CUSTOM_ID, urlTemplate, undefined, { ...boolOptions });
		} else {
			baseLayer = BaseLayers.ALL.find(x => x.id === id);
			if (!baseLayer) {
				alert('Invalid base layer id.');
				return;
			}
			baseLayer.addOptions(boolOptions);
		}

		return baseLayer;
	}
	
	return {
		getBaseLayer,
		BaseLayers,
	}
});