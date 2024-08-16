/** @exports HyperCube*/
define([], function () {
    /** Provides easy access to the properties and data of a Qlik HyperCube.*/
    class HyperCube {
        /**
         * @param {Object} layout The layout object from a Qlik HyperCube.
         */
        constructor(layout) {
            this.layout = layout;
        }

        get hyperCube() {
            const { qHyperCube } = this.layout;
            return qHyperCube || {};
        }

        /** First data page of the HyperCube.*/
        get dataPage() {
            const { qDataPages } = this.hyperCube;
            return (qDataPages && qDataPages.length) ? qDataPages[0] : {};
        }

        get matrix() {
            const { qMatrix } = this.dataPage;
            return qMatrix || [];
        }

        get dimensionInfo() {
            const { qDimensionInfo } = this.hyperCube;
            return qDimensionInfo || [];
        }

        get measureInfo() {
            const { qMeasureInfo } = this.hyperCube;
            return qMeasureInfo || [];
        }

        /** Combined dimension and measure information. */
        get info() {
            return this.dimensionInfo.concat(this.measureInfo);
        }

        /** Labels (fallback titles) of all dimensions and measures in the HyperCube. */
        get labels() {
            return this.info.map(x => x.qFallbackTitle);
        }

        get measureLabels() {
            return this.measureInfo.map(x => x.qFallbackTitle);
        }

        /** Field definitions for all dimensions. */
        get dimensionFields() {
            return this.dimensionInfo.map(x => x.qGroupFieldDefs[0]);
        }

        /** Checks if the HyperCube has both dimensions and measures, and a non-empty data matrix. */
        hasDimensionsAndMeasures() {
            return (
                isNonEmpty(this.dimensionInfo) &&
                isNonEmpty(this.measureInfo) &&
                isNonEmpty(this.matrix)
            );
        }

        /**
         * Get value (qText or qNum) from a HyperCube matrix cell.
         *
         * @param {number} rowIndex - Index of the row within the matrix.
         * @param {number} cellIndex - Index of the cell within the row.
         */
        getCellValue(rowIndex, cellIndex) {
            if ((rowIndex >= this.matrix.length) || (cellIndex >= Object.keys(this.matrix[rowIndex]).length)) {
                return;
            }

            if (cellIndex >= this.matrix[rowIndex].length) {
                return;
            }

            const item = this.matrix[rowIndex][cellIndex];

            if (item && item.hasOwnProperty('qNum') && !isNaN(item.qNum)) {
                return item.qNum;
            }

            if (item && item.hasOwnProperty('qText')) {
                return item.qText;
            }

            return;
        }

        getMeasureCellValue(rowIndex, measureIndex) {
            const cellIndex = this.dimensionInfo.length + measureIndex;
            return this.getCellValue(rowIndex, cellIndex);
        }

        /**
         * Maps the labels of dimensions or measures to their corresponding values
         * for a specific row in the HyperCube's data matrix.
         */
        mapLabelsToValues(rowIndex, cellIndices) {
            const labels = this.labels;
            const map = {};
            cellIndices.forEach((cellIndex) => {
                map[labels[cellIndex]] = this.getCellValue(rowIndex, cellIndex);
            });
            return map;
        }

        updateDimensionLabels(updateFn) {
            this.layout.qHyperCube.qDimensionInfo.forEach((item) => {
                item.qFallbackTitle = updateFn(item.qFallbackTitle);
            });
        }

        updateMeasureLabels(updateFn) {
            this.layout.qHyperCube.qMeasureInfo.forEach((item) => {
                item.qFallbackTitle = updateFn(item.qFallbackTitle);
            });
        }

        /**
         * Maps the labels of measures to their corresponding values, for a row 
         * in the HyperCube data matrix. 
         * 
         * @param {number} rowIndex 
         * @param {Array<number>} measureIndices - Indices, corresponding to the
         *      HyperCube's qMeasureInfo, of the measures to include in the 
         *      resulting map.
         * @returns {Object<string, any>}
         */
        mapMeasureLabelsToValues(rowIndex, measureIndices) {
            const labels = this.measureLabels;
            const map = {};
            measureIndices.forEach((measureIndex) => {
                map[labels[measureIndex]] = this.getMeasureCellValue(rowIndex, measureIndex);
            });
            return map;
        }
		
		alertDimensionAndMeasureErrors(msg='') {
			const errors = this.info.map(x => x?.qError).filter(x => x);
			if (errors.length) {
				alert(`laser-map ext hypercube error: ${msg} ${JSON.stringify(errors)}`);
			}		
		}
    }

    return HyperCube;
});