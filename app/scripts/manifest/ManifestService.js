'use strict';

/*
 * console:
 * angular.element(document.body).injector().get('ManifestService')
 */

/** @ngInject */
function ManifestService(
	$log, APIService/*, $timeout, $http, $q, $state, $rootScope,*/
)
{
	$log.debug('\nManifestService::Init\n');

	var Service = function()
	{
		var self = this;
		var manifestInitialized = false;
		var data;
		var overrides;

		var componentIdx;

		// if these are not defined by the route
		// the manifest components will teach this service
		// what the values should be
		var lang;
		var pageId;

		function getData()
		{
			return data;
		}
		function setData( d )
		{
			data = d;
		}

		function getOverrides()
		{
			return overrides;
		}
		function setOverrides( data )
		{
			overrides = data;
		}

		function getComponentIdx()
		{
			return componentIdx;
		}
		function setComponentIdx( cmpIdx )
		{
			componentIdx = cmpIdx;
		}

		/*
		 * Determines manifest idx of next component when recursing the manifest
		 * first looks for sub-component
		 * next looks for sibling
		 * then it backs up to the parent and looks for sibling until it finds
		 * one or gets back to the root
		 */
		function getNextComponent()
		{
			var idx = getComponentIdx();
			var cmp = null;
			if ( !idx )
			{
				idx = [0];
				cmp = self.getComponent( idx );
			} else {
				// get current Component and find next
				cmp = self.getComponent( idx );

				if ( !!cmp.components && cmp.components.length > 0 )
				{
					// sub-components exist - go deeper
					idx.push( 0 );
					cmp = self.getComponent( idx );
				} else {
					// no children - try to find next sibling
					var lastIdx = idx.pop();
					idx.push( ++lastIdx );
					cmp = self.getComponent( idx );

					if ( !cmp )
					{
						// no sibling - find closest ancestor's sibling
						var backup = true;
						while ( !cmp && backup )
						{
							if (idx.length > 1)
							{
								// try parent's sibling
								idx.pop();
								lastIdx = idx.pop();
								idx.push( ++lastIdx );
								cmp = self.getComponent( idx );
							} else {
								// back to root - done
								backup = false;
								idx = null;
							}
						}
					}
				}
			}
			setComponentIdx( idx );
			if ( !idx )
			{
				return null;
			}
			return cmp;
		}

		function deserializeIdx( idx )
		{
			if ( angular.isArray( idx ) )
			{
				return idx;
			}
			if ( typeof( idx ) === 'string' )
			{
				// convert string rep of array to integer array
				idx = idx.replace(/[\[\]]/g, '');
				var arr = idx.split(',');
				// force array values to integer
				for(var i=0; i<arr.length;i++)
				{
					arr[i] = +arr[i] || 0;  // default to 0 if NaN!?
				}
				return arr;
			}
			return [0];
		}

		/*
		 * Initializes the component for the manifest
		 */
		function initializeComponent( cmp )
		{
			if ( !cmp )
			{
				return;
			}

			if ( !manifestInitialized )
			{
				// first pass, check overrides and modify this component
				var cmpId = (cmp.data||{}).cmpId;
				var newData = getOverrides()[ cmpId ];
				if ( !!cmpId && !!newData )
				{
					// found override for this component!
					$log.debug('ManifestService::getComponent: override cmpId:', cmpId, newData );
					if ( typeof( newData ) === 'string' )
					{
						switch( newData )
						{
							case 'delete':
								// get parent cmp
								var cmpIdx = getComponentIdx().slice(0);
								var childIdx = cmpIdx.pop();
								var parentCmp = self.getComponent( cmpIdx );
								// and delete sub component's idx
								var thisChild = parentCmp.components.splice( childIdx, 1 );
								$log.debug( 'ManifestService::getComponent: override: delete cmpId', cmpIdx, cmp );
								// fix current idx (-1 or pop if 0)
								if ( childIdx > 0 )
								{
									getComponentIdx()[ getComponentIdx().length-1 ] = childIdx-1;
								} else {
									getComponentIdx().pop();
								}
								break;
							default:
								try {
									newData = angular.fromJson( newData );
								} catch(e) {
									$log.debug( 'ManifestService::getComponent: override: did not know what to do with cmpId:', cmpId, newData );
								}
								break;
						}
					}
					if ( typeof( newData ) === 'object' )
					{
						angular.extend( cmp.data, newData );
					}
				}
			}

			// will we ever re-index after manifest initialization!?
			// index component
			cmp.idx = getComponentIdx().slice(0);
			$log.debug('ManifestService::getComponent: initialized:', cmp.idx, cmp );
		}

		/*
		 * Gets the component from the manifest specified by the idx array
		 * if no idx is specified, use the service's idx
		 */
		this.getComponent = function( idx )
		{
			var cmp;
			if ( !idx )
			{
				// idx not specified, get next using services idx
				$log.debug('ManifestService::getComponent: getNextComponent' );
				cmp = getNextComponent();

				// initialize the component
				initializeComponent( cmp );
			} else {

				idx = deserializeIdx( idx );
				setComponentIdx( idx );
				$log.debug('ManifestService::getComponent: find component:', idx );

				// traverse idx array to retrieve this particular cmp
				cmp = getData()[ idx[0] ];
				if ( !!cmp )
				{
					for ( var j in idx )
					{
						if ( j>0 )
						{
							var components = cmp.components;
							if ( !!components )
							{
								cmp = components[ idx[j] ];
								if ( !cmp )
								{
									// child idx out of range
									return null;
								}
							} else {
								// no children
								return null;
							}
						}
					}
				} else {
					// root index out of range
					return null;
				}
				$log.debug('ManifestService::getComponent: found:', idx, cmp );
			}
			return cmp;
		};

		this.getFirst = function( cmpType, context )
		{
			if ( !context )
			{
				context = [0];
			}

			$log.debug( 'ManifestService::getFirst', cmpType, context );
			var cmp = self.getComponent( context );
			while ( !!cmp && cmp.type !== cmpType )
			{
				cmp = getNextComponent();
			}

			return cmp;
		};

		this.getAll = function( cmpType, context )
		{
			if ( !context )
			{
				context = [0];
			}
			var cmps = [];

			$log.debug( 'ManifestService::getAll', cmpType, context );
			var cmp = self.getComponent( context );
			while ( !!cmp )
			{
				$log.debug( 'ManifestService::getAll:match?', cmp.type, cmpType );
				if ( cmp.type === cmpType )
				{
					cmps.push( cmp );
					$log.debug( 'ManifestService::getAll:match!', cmps );
				}
				cmp = getNextComponent();
			}

			return cmps;
		};

		this.getLang = function()
		{
			return this.lang;
		};
		this.setLang = function(lang)
		{
			this.lang = lang;
		};

		this.getPageId = function()
		{
			return this.pageId;
		};
		this.setPageId = function(pageId)
		{
			// reset component index for reparsing new page
			setComponentIdx( null );

			this.pageId = pageId;
		};

		this.initialize = function( data, overrides )
		{
			$log.debug('ManifestService::initialize:', data, overrides);

			setData( data );
			setOverrides( overrides[0] );

			// index all components
			var cmp = self.getComponent();
			while ( !!cmp )
			{
				$log.debug( 'ManifestService:: initialParse', cmp );
				cmp = self.getComponent();
			}

			manifestInitialized = true;

			$log.debug('ManifestService::initialized:', getData() );
		};

	};
	return new Service();

}
