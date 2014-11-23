
var LOGGER = require( './utils/logger' )( 'ALL', 'ed' );
var config = require( '../config/global.config.json' );

var shenzi_socket = require( 'socket.io-client' )( 'http://localhost:' + config.shenzi.port );

shenzi_socket.on( 'connect', function( ){
	LOGGER.debug( 'Established Connection.' );
	
	shenzi_socket.emit( 'register', {
		type: 'ed',
		engine: 'nodejs',
		engine_version: process.version,
		arch: process.arch,
		platform: process.platform
	} );
} );

shenzi_socket.on( 'introduction', function( msg ){
	LOGGER.info( msg );
} );

shenzi_socket.on( 'err', function( msg ){
	LOGGER.error( msg );
} );

shenzi_socket.on( 'disconnect', function( ){
	LOGGER.warn( 'Disconnection' );
} );

LOGGER.info( 'Starting Ed.' );
LOGGER.info( 'Engine: ' + 'nodejs' );
LOGGER.info( 'Engine version: ' + process.version );
LOGGER.info( 'Archetecture: ' + process.arch );
LOGGER.info( 'Platform: ' + process.platform );