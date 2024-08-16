define([], function () {

	function asDimension(fieldName, label) {
		return {
			qDef: {
				qFieldDefs: [fieldName],
				qFieldLabels: [label]
			}
		}
	}

	class PointLayer() {
		constructor(props) {
			this.props = props;
		}
		
		_createHyperCube() {
			return {
				qHyperCubeDef: {
					qDimensions: [
						asDimension(this.props.latitudeField, 'latitude'),
						asDimension(this.props.longitudeField, 'longitude'),
						asDimension(this.props.labelField, 'label'),
					]
				}
			}
		}
	}
});