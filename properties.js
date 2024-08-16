define([
	'qlik',
	'./About',
	'./layer',
	'./utils',
], function(
	qlik,
	About,
	Layers,
	Util,
) {
	const { copyToClipboard, CRS_OPTIONS  } = Util;
	const { BaseLayers } = Layers;
	let variableList, variableListPromise;

	function getVariableListPromise() {
		if (!variableListPromise) {
			variableListPromise = qlik.currApp().createGenericObject({
				qVariableListDef: {
					qType: 'variable'
				}
			}).then(function (reply) {
				variableList = reply.layout.qVariableList.qItems.map(function (item) {
					return {
						value: item.qName,
						label: item.qName
					};
				});
				return variableList;
			});
		}
		return variableListPromise;
	}
	
	About();
	const about = {
		type: 'items',
		label: 'About',
        items: { about: { component: 'About' } },
	};
	
	const developerTools = { 
        type: 'items',
        label: 'Developer Tools',
        ref: 'developerTools',
        items: {
            copyDataButton: {
                component: 'button',
                label: 'Copy Data to Clipboard',
                action: copyToClipboard,
            }
        }
    };
	
	const appVariables = {
		type: 'items',
		label: 'App Variables',
		ref: 'appVariables',
		items: {
			latitudeVariable: {
				ref: 'appVariables.latitudeVariable',
				label: 'Latitude Variable',
				type: 'string',
				component: 'dropdown',
				options: function () {
					if (variableList) {
						return variableList;
					}
					return getVariableListPromise();
				},
				change: function (data) {
					data.latitude = data.latitude || {};
					data.latitude.qStringExpression = '="' + data.appVariables.latitudeVariable + '"';
				}
			},
			longitudeVariable: {
				ref: 'appVariables.longitudeVariable',
				label: 'Longitude Variable',
				type: 'string',
				component: 'dropdown',
				options: function () {
					if (variableList) {
						return variableList;
					}
					return getVariableListPromise();
				},
				change: function (data) {
					data.longitude = data.longitude || {};
					data.longitude.qStringExpression = '="' + data.appVariables.longitudeVariable + '"';
				}
			},
		}
	};
	
	const useCustomBaseLayer = (x) => { return x.baseLayer.id === BaseLayers.CUSTOM_ID }
	const baseLayerRefresh = (data) => {
		// TODO use $scope.watchCollection() to update map on changes
		data.baseLayer = data?.baseLayer || {};
		data.baseLayer.refresh = data?.baseLayer?.refresh || 0;
		data.baseLayer.refresh++;
	};
	
	const baseLayer = {
		type: 'items',
		ref: 'baseLayer',
		label: 'Base Layer',
		component: 'expandable-items',
		items: {
			template: {
				type: 'items',
				label: 'Template',
				items: {
					id: {
						type: 'string',
						component: 'dropdown',
						label: 'Template',
						ref: 'baseLayer.id',
						options: BaseLayers.IDs.map(x => {return { value: x, label: x }}),
						change: baseLayerRefresh,
					},
					refresh: {
						component: 'text',
						label: 'Refresh the page after changing the template.'
					},
					customUrl: {
						type: 'string',
						expression: 'optional',
						ref: 'baseLayer.customUrl',
						label: 'Custom Template URL',
						show: useCustomBaseLayer,
					},
					docs: {
						component: 'link',
						label: 'See "URL Template" section here for acceptable values.',
						url: 'https://leafletjs.com/reference.html#tilelayer',
						show: useCustomBaseLayer,
					},
				}
			},
			noWrap: {
				type: 'items',
				label: 'Wrap',
				items: {
					info: {
						component: 'text',
						label: 'Whether the layer is wrapped around the antimeridian. If checked, the GridLayer will only be displayed once at low zoom levels.'
					},
					noWrap: {
						type: 'boolean',
						label: 'No Wrap',
						ref: 'baseLayer.options.bool.noWrap',
						defaultValue: true,
						change: baseLayerRefresh,
					}
				}
			},
			tms: {
				type: 'items',
				label: 'TMS',
				show: useCustomBaseLayer,
				items: {
					info: {
						component: 'text',
						label: 'If TMS is checked, inverses Y axis numbering for tiles (use for TMS services).'
					},
					tms: {
						type: 'boolean',
						ref: 'baseLayer.options.bool.tms',
						label: 'TMS',
						defaultValue: false,
						change: baseLayerRefresh,
					},
					wiki: {
						component: 'link',
						label: 'TMS wiki',
						url: 'https://en.wikipedia.org/wiki/Tile_Map_Service',
					},
					docs: {
						component: 'link',
						label: 'Leaflet docs on TMS',
						url: 'https://leafletjs.com/examples/wms/wms.html'
					},
					
				}
			},
			crs: {
				type: 'items',
				label: 'CRS',
				show: useCustomBaseLayer,
				items: {
					info: {
						component: 'text',
						label: "Coordinate Reference System (CRS). Don't change this if you're not sure what it means.",
					},
					crs: {
						type: 'string',
						component: 'dropdown',
						label: 'CRS',
						ref: 'baseLayer.options.crs',
						options: Object.keys(CRS_OPTIONS).map(key => ({ value: key, label: key })),
						change: baseLayerRefresh,
					},
					docs: {
						component: 'link',
						url: 'https://leafletjs.com/reference.html#crs',
						label: 'Leaflet docs on CRS'
					},
				}
			},
		}
	};
	
	const pointLayers = {
		type: 'array',
		ref: 'pointLayers',
        label: 'Point Layers',
        itemTitleRef: 'layerLabel',
        allowAdd: true,
        allowRemove: true,
        allowMove: true,
        addTranslation: 'Add Point Layer',
		items: {
			layerLabel: {
				type: 'string',
				expression: 'optional',
				ref: 'layerLabel',
				label: 'Layer Label'
			},
			latitudeField: {
				type: 'string',
				label: 'Latitude Dimension Name',
				ref: 'latitudeField',
			},
			longitudeField: {
				type: 'string',
				label: 'Longitude Dimension Name',
				ref: 'longitudeField'
			},
			labelField: {
				type: 'string',
				label: 'Label Dimension Name',
				ref: 'labelField'
			},
			markerSVG: {
				type: 'string',
				expression: 'optional',
				label: 'Marker SVG',
				ref: 'markerSVG'
			}
		}
	};

	return {
		type: 'items',
		component: 'accordion',
		items: {
			about,
			appVariables,
			baseLayer,
			pointLayers,
			appearance: { uses: 'settings' },
			developerTools,
		}
	}
});