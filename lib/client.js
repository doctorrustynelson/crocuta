var LOGGER = require( './utils/logger' )( 'ALL', 'crocuta' );
//var path = require( 'path' );
var Job = require( './job' );
var config = require( './utils/config' );

function Client( ){
	var socket = require( 'socket.io-client' )( 'http://' + config.get( 'shenzi.host' ) + ':' + config.get( 'shenzi.port' ) );
	var ready = false;

	socket.on( 'connect', function( ){
		LOGGER.debug( 'Established connection.' );
		ready = true;
		
		socket.emit( 'register', {
			type: 'client',
			engine: 'nodejs',
			engine_version: process.version,
			arch: process.arch,
			platform: process.platform
		} );
	} );

	socket.on( 'err', function( msg ){
		LOGGER.error( msg );
	} );

	socket.on( 'disconnect', function( ){
		LOGGER.warn( 'Disconnected.' );
		ready = false;
	} );
	
	this.isReady = function( ){
		return ready;
	};
	
	this.onReady = function( callback ){
		if( ready ){
			callback(  );
		} else {
			socket.on( 'connect', function( ){
				callback( );
			} );
		}
	};
	
	this.shutdown = function( ){
		socket.disconnect( );
	};
	
	this.createJob = function( name ){
		return new Job( this, name );
	};
	
	this._socket = socket;
}

module.exports = Client;