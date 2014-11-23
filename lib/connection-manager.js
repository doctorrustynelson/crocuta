/**
 * New node file
 */

var LOGGER = require( './utils/logger' )( 'ALL', 'Connection Manager' );

function ConnectionManager( ){
	var nodes = {
		banzai: {},
		client: {},
		ed: {},
		shenzi: {}
	};
	
	this.register = function( ip_address, data, socket ){
		if( !data.hasOwnProperty( 'type' ) ){
			throw new Error( 'A "type" is required for registration.' );
		}
		
		if( !data.hasOwnProperty( 'arch' ) ){
			data.arch = '-';
		}
		
		if( !data.hasOwnProperty( 'engine' ) ){
			throw new Error( 'A "engine" is required for registration.' );
		}
		
		if( !data.hasOwnProperty( 'engine_version' ) ){
			data.engine_version = '-';
		}
		
		if( !data.hasOwnProperty( 'platform' ) ){
			data.platform = '-';
		}
		
		switch( data.type ){
			case 'ed': 
			case 'banzai':
			case 'client': 
				if( nodes[ data.type ][ ip_address ] !== undefined &&
					nodes[ data.type ][ ip_address ].state === 'disconnected'
				){
					throw new Error( 'An "' + data.type + '" node is already registed at ' + ip_address + '.' );
				}
				
				nodes[ data.type ][ ip_address ] = {
					arch: data.arch,
					engine: data.engine,
					engine_version: data.engine_version,
					platform: data.platform,
					socket: socket
				};
				
				LOGGER.info( 'Registered new ' + data.type + ' @ ' + ip_address + ' : ' + JSON.stringify( 
					nodes[ data.type ][ ip_address ], 
					[ 'arch', 'engine', 'engine_version', 'platform' ], 
					'    ' ) );
				break;
			default:
				throw new Error( data.type + ' is not a valid "type".' );
		}
	};
	
	this.getConnectionType = function( ip_address ){
		if( nodes.ed.hasOwnProperty( ip_address ) ){
			return 'ed';
		}
		
		if( nodes.banzai.hasOwnProperty( ip_address ) ){
			return 'banzai';
		}
		
		if( nodes.client.hasOwnProperty( ip_address ) ){
			return 'client';
		}
		
		return undefined;
	};
	
	this.disconnect = function( ip_address ){	
		var type = this.getConnectionType( ip_address );
		
		if( type === undefined ){
			throw new Error( 'No registered node @ ' + ip_address + ' to disconnect.' );
		}
		
		LOGGER.warn( type + ' @ ' + ip_address + ' has disconnected.' );
		
		nodes[ type ][ ip_address ].state = 'disconnected';
		nodes[ type ][ ip_address ].socket = null;
	};
	
}

module.exports = ConnectionManager;