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

	var io = require( 'socket.io' )( );
	var shenzi_socket = require( 'socket.io-client' )( 'http://' + config.get( 'shenzi.host' ) + ':' + config.get( 'shenzi.port' ), config.get( 'banzai.connection.options' ) );
	var shenzi_connected = false;
	
	var connection_manager = new ConnectionManager( );
	var data_director = new DataDirector( );
	
	/*********************************************************************************************************************/
	/*                                                 Ed Communication                                                  */
	/*********************************************************************************************************************/
	
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
			console.log( result );
			if( result.success ){
				LOGGER.debug( 'Confirming hold of ' + result.key + '.' );
				data_director.finishStore( result.key, ip_address );
			} else {
				LOGGER.debug( 'Error durring hold of ' + result.key + '.' );
				data_director.failStore( result.key, ip_address );
			}
			
			if( shenzi_connected ){
				shenzi_socket.emit( 'upload:complete', result );
			}
		} );
		
		socket.on( 'lose-confirmation', function( result ){
			if( result.success ){
				LOGGER.debug( 'Confirming lose of ' + result.key + '.' );
				data_director.lostStore( result.key, ip_address );
			} else {
				LOGGER.debug( 'Error durring hold of ' + result.key + '.' );
			}
			
			if( shenzi_connected ){
				shenzi_socket.emit( 'delete:complete', result );
			}
		} );
		
		socket.on( 'get-confirmation', function( result ){
			LOGGER.debug( 'Confirming get of ' + result.key + '.' );
			//TODO: forward get request to requester
			
			if( shenzi_connected ){
				shenzi_socket.emit( 'get:complete', result );
			}
		} );
		
		socket.on( 'list-confirmation', function( result ){
			if( result.success ){
				LOGGER.debug( 'Confirming list of data.' );
				data_director.registerLocation( ip_address, result.keys );
			} else {
				LOGGER.debug( 'Error durring list of data.' );
			}
			
			if( shenzi_connected ){
				shenzi_socket.emit( 'list:complete', result );
			}
		} );
		
		socket.on( 'getLocationsOf', function( key, callback ){
			callback( data_director.getLocations( key ) );
		} );
		
		socket.on( 'getKeysUnder', function( key, callback ){
			callback( data_director.getChildrenOf( key ) );
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
	
	shenzi_socket.on( 'connect', function( ){
		LOGGER.debug( 'Established Connection.' );
		shenzi_connected = true;
		
		shenzi_socket.emit( 'register', {
			type: 'banzai',
			engine: 'nodejs',
			engine_version: process.version,
			arch: process.arch,
			platform: process.platform
		} );
	} );
	
	shenzi_socket.on( 'upload', function( file ){
		var ed = connection_manager.getEd( );
		data_director.startStore( file.key, ed.ip_address );
		ed.socket.emit( 'hold-data', file );
	} );
	
	shenzi_socket.on( 'err', function( msg ){
		LOGGER.error( msg );
	} );
	
	shenzi_socket.on( 'disconnect', function( ){
		LOGGER.warn( 'Disconnection' );
		shenzi_connected = false;
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