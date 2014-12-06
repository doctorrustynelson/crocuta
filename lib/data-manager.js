/**
 * New node file
 */
var path = require( 'path' );
var fs = require( 'fs' );
var LOGGER = require( './utils/logger' )( 'ALL', 'Data Manager' );

function DataManager( config_loc ){
	
	var config = require( './utils/config' )( config_loc || path.resolve( __dirname, '../config/global.config.json' ) );
	
	var data_map = {};
	var data_root = config.ed.data.location;
	
	// Initialize data_map
	fs.readdirSync( data_root ).forEach( function( key ){
		data_map[ key ] = {};
	} );
	
	function getLocation( key ){
		return path.join( data_root, key );
	}
	
	this.listKeys = function( ){
		return Object.keys( data_map ).filter( function( key ){
			return data_map[ key ] !== undefined;
		} );
	};

	this.store = function( key, data, callback ){
		var location = getLocation( key );
		fs.writeFile( location, data, function( err ){
			if( !err ){
				data_map[ key ] = { /* TODO: figure out what to store here. */ };
			} else {
				LOGGER.error( 'Problem storing data to key: ' + key );
			}
			callback( err );
		} );
	};
	
	this.storeSync = function( key, data ){
		var location = getLocation( key );
		fs.writeFileSync( location, data );
		data_map[ key ] = { /* TODO: figure out what to store here. */ };
	};
	
	this.lose = function( key, callback ){
		var location = getLocation( key );
		data_map[ key ] = undefined;
		fs.unlink( location, callback );
	};
	
	this.loseSync = function( key ){
		var location = getLocation( key );
		data_map[ key ] = undefined;
		fs.unlinkSync( location );
	};
	
	this.get = function( key, callback ){
		var location = getLocation( key );
		return fs.readFile( location, callback );
	};
	
	this.getSync = function( key ){
		var location = getLocation( key );
		return fs.readFileSync( location );
	};
}

module.exports = DataManager;