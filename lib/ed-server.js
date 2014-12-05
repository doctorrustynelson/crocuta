
var LOGGER = require( './utils/logger' )( 'ALL', 'ed' );
var path = require( 'path' );

function Ed( config_loc ){

	var config = require( './utils/config' )( config_loc || path.resolve( __dirname, '../config/global.config.json' ) );
	
	var shenzi_socket = require( 'socket.io-client' )( 'http://' + config.shenzi.host + ':' + config.shenzi.port, config.ed.connection.options );
	var banzai_socket = require( 'socket.io-client' )( 'http://' + config.banzai.host + ':' + config.banzai.port, config.ed.connection.options );
	
/*********************************************************************************************************************/
/*                                               Shenzi Communication                                                */
/*********************************************************************************************************************/
	shenzi_socket.on( 'connect', function( ){
		LOGGER.debug( 'Established Connection to Shenzi.' );
		
		//TODO: add os.cpus()
		shenzi_socket.emit( 'register', {
			type: 'ed',
			engine: 'nodejs',
			engine_version: process.version,
			arch: process.arch,
			platform: process.platform
		} );
	} );
	
	// Shenzi Error Handler
	shenzi_socket.on( 'err', function( msg ){
		LOGGER.error( msg );
	} );
	
	// Shenzi Disconnect Handler
	shenzi_socket.on( 'disconnect', function( ){
		LOGGER.warn( 'Disconnection' );
	} );
	
	// Shenzi Spawned New Banzai
	shenzi_socket.on( 'banzai moved', function( ){
		//TODO: handle when banzai comes up somewhere else
	} );
	
	// Shenzi Joule request
	shenzi_socket.on( 'joule', function( joule ){
		
		switch( joule.deploy ){
			case 'anonymous':
				LOGGER.debug( 'Running Anonymous Joule.' );
				LOGGER.debug( joule.func );
				var func = eval( '(' + joule.func + ')' );
				
				func( 'inputs', 'outputs', 'other' );
				break;
			case 'named':
				//TODO
				break;
			default: 
				shenzi_socket.emit( 'err', { 'type': 'joule', 'msg': 'Can not run Joule of deployment type ' + joule.deploy + '.' } );
				break;
		}
		
	} );

/*********************************************************************************************************************/
/*                                               Banzai Communication                                                */
/*********************************************************************************************************************/
	banzai_socket.on( 'connect', function( ){
		LOGGER.debug( 'Established Connection to Banzai.' );
		
		//TODO: add os.cpus()
		banzai_socket.emit( 'register', {
			type: 'ed',
			engine: 'nodejs',
			engine_version: process.version,
			arch: process.arch,
			platform: process.platform
		} );
	} );
	
	//Banzai Error Handler
	banzai_socket.on( 'err', function( msg ){
		LOGGER.error( msg );
	} );
	
	// Banzai Disconnect Handler
	banzai_socket.on( 'disconnect', function( ){
		LOGGER.warn( 'Disconnection' );
	} );
	
	// Banzai Spawned New Shenzi
	banzai_socket.on( 'shenzi moved', function( ){
		//TODO: handle when banzai comes up somewhere else
	} );

/*********************************************************************************************************************/
/*                                                       Other                                                       */
/*********************************************************************************************************************/
	
	this.stop = function( ){
		LOGGER.info( 'Closing Ed.' );
		shenzi_socket.disconnect( true );
		banzai_socket.disconnect( true );
	};

	LOGGER.info( 'Starting Ed.' );
	LOGGER.info( 'Engine: ' + 'nodejs' );
	LOGGER.info( 'Engine version: ' + process.version );
	LOGGER.info( 'Archetecture: ' + process.arch );
	LOGGER.info( 'Platform: ' + process.platform );
}

module.exports = Ed;