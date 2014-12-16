/**
 * New node file
 */

//var LOGGER = require( './utils/logger' )( 'ALL', 'Data Director' );
var config = require( './utils/config' );

function DataUnit( key ){
	this.key = key;
	this.locations = {};
	
	this.state = function( location ){
		if( location === undefined ){
			var ready = false;
			var failure = false;
			var locations = this.locations;
			
			Object.keys( locations ).forEach( function( location ){
				switch( locations[ location ] ){
					case 'stored':
						ready = true;
						break;
					case 'failed':
						failure = true;
						/* falls through */
					case 'pending':
						/* falls through */
					default:
						break;
				}
			} );
			
			if( ready )
				return 'stored';
			
			if( failure )
				return 'failed';
				
			return 'pending';
		} else {
			if( this.locations[ location ] === undefined )
				throw new Error( 'Not a Registered Location.' );
			else
				return this.locations[ location ];
		}
	};
	
	this.balanced = function( ){
		if( Object.keys( this.locations ).length < config.get( 'banzai.data.replication' ) )
			return false;
		
		return true;
	};
}

function DataDirector( ){

	var data_map = {};
	var store_map = {};
	
	function deconstructKey( key ){
		return key.split( '.' );
	}
	
	function primeDataMap( full_key, key, focused_data_map ){
		if( key === undefined )
			key = deconstructKey( full_key );
		
		
		if( focused_data_map === undefined )
			focused_data_map = data_map;
		
		
		if( key.length === 1 ){
			if( focused_data_map[ key[ 0 ] ] === undefined )
				focused_data_map[ key[ 0 ] ] = new DataUnit( full_key );
			
			if( focused_data_map[ key[ 0 ] ] instanceof DataUnit ){
				return focused_data_map[ key[ 0 ] ];
			} else {
				throw new Error( 'Key does not resolve to a DataUnit.' );
			}
		}
		
		if( focused_data_map[ key[ 0 ] ] === undefined ){
			focused_data_map[ key[ 0 ] ] = { };
		}
		
		if( focused_data_map[ key[ 0 ] ] instanceof DataUnit ){
			throw new Error( 'Can not prime child of already existing DataUnit.' );
		}
		
		return primeDataMap( full_key, key.slice( 1 ), focused_data_map[ key[ 0 ] ] ); 
	}
	
	function getDataMap( full_key, key, focused_data_map ){
		if( key === undefined )
			key = deconstructKey( full_key );
		
		
		if( focused_data_map === undefined )
			focused_data_map = data_map;
		
		
		if( key.length === 1 ){
			if( focused_data_map[ key[ 0 ] ] === undefined )
				throw new Error( 'Key does not resolve to a DataUnit.' );
			
			if( focused_data_map[ key[ 0 ] ] instanceof DataUnit ){
				return focused_data_map[ key[ 0 ] ];
			} else {
				throw new Error( 'Key does not resolve to a DataUnit.' );
			}
		}
		
		if( focused_data_map[ key[ 0 ] ] === undefined ){
			throw new Error( 'Key does not resolve to a DataUnit.' );
		}
		
		return primeDataMap( full_key, key.slice( 1 ), focused_data_map[ key[ 0 ] ] ); 
	}
	
	function primeStoreMap( location, full_key ){
		if( store_map[ location ] === undefined )
			store_map[ location ] = [];
		
		if( full_key && store_map[ location ].indexOf( full_key ) === -1 ){
			store_map[ location ].push( full_key );
		}
	}
	
	this.startStore = function( key, location ){
		var data = primeDataMap( key );
		data.locations[ location ] = 'pending';
		primeStoreMap( location, key );
	};
	
	this.finishStore = function( key, location ){
		var data = getDataMap( key );
		data.locations[ location ] = 'stored';
		primeStoreMap( location, key );
	};
	
	this.failedStore = function( key, location ){
		var data = getDataMap( key );
		data.locations[ location ] = 'failed';
		primeStoreMap( location, key );
	};
	
	this.lostStore = function( key, location ){
		var data = getDataMap( key );
		data.locations[ location ] = undefined;
		var index = store_map[ location ].indexOf( key );
		store_map[ location ].splice( index, 1 );
	};
	
	this.getState = function( key, location ){
		var data = getDataMap( key );
		return data.state( location );
	};
	
	this.getLocations = function( key ){
		var data = getDataMap( key );
		return Object.keys( data.locations );
	};
	
	this.registerLocation = function( location, keys ){
		keys.forEach( function( key ){
			var data = primeDataMap( key );
			data.locations[ location ] = 'stored';
			primeStoreMap( location, key );
		} );
	};
	
	this.lostLocation = function( location ){
		primeStoreMap( location );
		store_map[ location ].forEach( function( key ){
			var data = getDataMap( key );
			data.locations[ location ] = undefined;
		} );
		store_map[ location ] = undefined;
	};
}

module.exports = DataDirector;