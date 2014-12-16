/**
 * Banzai server (Data Master)
 * 
 * Banzai manages the data and joules stored on the Eds. Banzai does not maintain any of the data and instead passes 
 * it on to three Eds if there are three available.  Banzai does maintain copies of all named joules so they can be
 * reused.
 * 
 */

var LOGGER = require( './utils/logger' )( 'ALL', 'banzai' );
var ConnectionManager = require( './connection-manager' );
var DataDirector = require( './data-director' );
var config = require( './utils/config' );

function Banzai( ){

	/*********************************************************************************************************************/
	/*                                                 Ed Communication                                                  */
	/*********************************************************************************************************************/
	
	var io = require( 'socket.io' )( );
	var connection_manager = new ConnectionManager( );
	var data_director = new DataDirector( );
	
	io.on( 'connection', function( socket ){
		var ip_address = socket.request.connection._peername.address + ':' + socket.request.connection._peername.port;
		
		LOGGER.debug( ip_address + ' # ' + 'Recieved connection.' );
		
		socket.on( 'register', function( data ){
			LOGGER.info( ip_address + ' # ' + 'Registration request' );
			data_director.registerLocation( ip_address, data.datakeys );
			
			try{ 
				connection_manager.register( ip_address, data, socket );
			} catch ( exception ){
				LOGGER.warn( ip_address + ' # ' + exception.message );
				socket.emit( 'err', exception.message );
				socket.disconnect();
			}
		} );
		
		socket.on( 'hold-confirmation', function( result ){
			if( result.success ){
				LOGGER.debug( 'Confirming hold of ' + result.key + '.' );
				data_director.finishStore( result.key, ip_address );
			} else {
				LOGGER.debug( 'Error durring hold of ' + result.key + '.' );
				data_director.failStore( result.key, ip_address );
			}
		} );
		
		socket.on( 'lose-confirmation', function( result ){
			if( result.success ){
				LOGGER.debug( 'Confirming lose of ' + result.key + '.' );
				data_director.lostStore( result.key, ip_address );
			} else {
				LOGGER.debug( 'Error durring hold of ' + result.key + '.' );
			}
		} );
		
		socket.on( 'get-confirmation', function( result ){
			LOGGER.debug( 'Confirming get of ' + result.key + '.' );
			//TODO: forward get request to requester
		} );
		
		socket.on( 'list-confirmation', function( result ){
			if( result.success ){
				LOGGER.debug( 'Confirming list of data.' );
				data_director.registerLocation( ip_address, result.keys );
			} else {
				LOGGER.debug( 'Error durring list of data.' );
			}
		} );
		
		socket.on( 'err', function( msg ){
			LOGGER.error( msg );
		} );
		
		socket.on( 'disconnect', function( ){
			try{
				connection_manager.disconnect( ip_address );
				data_director.lostLocation( ip_address );
			} catch ( exception ) {
				LOGGER.warn( exception );
			}
			
		} );
	} );
	
	/*********************************************************************************************************************/
	/*                                               Shenzi Communication                                                */
	/*********************************************************************************************************************/
	
	var shenzi_socket = require( 'socket.io-client' )( 'http://' + config.get( 'shenzi.host' ) + ':' + config.get( 'shenzi.port' ), config.get( 'banzai.connection.options' ) );
	
	shenzi_socket.on( 'connect', function( ){
		LOGGER.debug( 'Established Connection.' );
		
		shenzi_socket.emit( 'register', {
			type: 'banzai',
			engine: 'nodejs',
			engine_version: process.version,
			arch: process.arch,
			platform: process.platform
		} );
	} );
	
	shenzi_socket.on( 'err', function( msg ){
		LOGGER.error( msg );
	} );
	
	shenzi_socket.on( 'disconnect', function( ){
		LOGGER.warn( 'Disconnection' );
	} );
	
	this.stop = function( ){
		LOGGER.info( 'Closing Banzai.' );
		shenzi_socket.disconnect( true );
		io.close( );
	};
	
	LOGGER.info( 'Starting Banzai.' );
	LOGGER.info( 'Listening on port ' + config.get( 'banzai.port' ) + '.' );
	LOGGER.info( 'Engine: ' + 'nodejs' );
	LOGGER.info( 'Engine version: ' + process.version );
	LOGGER.info( 'Archetecture: ' + process.arch );
	LOGGER.info( 'Platform: ' + process.platform );
	io.listen( config.get( 'banzai.port' ) );
}

module.exports = Banzai;