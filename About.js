define([
    'client.property-panel/components/components',
    'client.property-panel/component-utils',
], function (components, componentUtils) {
    return function () {
		if (!components.hasComponent('About')) {

			const template = `
				<div>

					<b>Extension: olivia-map</b>
					<ul>
						<li>Author: Olivia Kroop</li>
						<li>Last Modified: 12 July 2024</li>
						<li>Description: Map with pin drop capability.</li>
					</ul>
				</div>
			`;

			let aboutComponent = {
				template: template,
				controller: [
					'$scope',
					function (scope) {
						let data = function () {
							return scope.data;
						};
						componentUtils.defineLabel(
							scope,
							scope.definition,
							data,
							scope.args.handler
						),
							componentUtils.defineVisible(
								scope,
								scope.args.handler
							),
							componentUtils.defineReadOnly(
								scope,
								scope.args.handler
							),
							componentUtils.defineChange(
								scope,
								scope.args.handler
							),
							componentUtils.defineValue(
								scope,
								scope.definition,
								data
							),
							(scope.getDescription = function (description) {
								return 'About' === description;
							});
					},
				],
			};
			return (
				components.addComponent('About', aboutComponent), aboutComponent
			);
		}
    };
});
