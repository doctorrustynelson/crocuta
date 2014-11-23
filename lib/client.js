var LOGGER = require( './utils/logger' )( 'ALL', 'crocuta' );
var config = require( '../config/global.config.json' );
var Job = require( './job' );

var socket = require( 'socket.io-client' )( 'http://localhost:' + config.shenzi.port );
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

module.exports = {
	
	isReady: function( ){
		return ready;
	},
	
	onReady: function( callback ){
		if( ready ){
			callback(  )
		} else {
			socket.on( 'connect', function( ){
				callback( );
			} );
		}
	},

	shutdown: function( ){
		socket.disconnect( );
	},
	
	createJob: function( name ){
		return new Job( this, name );
	},
	
	_socket: socket
};