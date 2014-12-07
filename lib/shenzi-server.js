/**
 * New node file
 */

var LOGGER = require( './utils/logger' )( 'ALL', 'shenzi' );
//var path = require( 'path' );
var ConnectionManager = require( './connection-manager' );
var config = require( './utils/config' );

function Shenzi( ){

	var io = require( 'socket.io' )( );
	var connection_manager = new ConnectionManager();
	
	io.on( 'connection', function( socket ){
		var ip_address = socket.request.connection._peername.address + ':' + socket.request.connection._peername.port;
		
		LOGGER.debug( ip_address + ' # ' + 'Recieved connection.' );
		
		socket.on( 'register', function( data ){
			LOGGER.info( ip_address + ' # ' + 'Registration request' );
			try{ 
				connection_manager.register( ip_address, data, socket );
			} catch ( exception ){
				LOGGER.warn( ip_address + ' # ' + exception.message );
				socket.emit( 'err', exception.message );
				socket.disconnect();
			}
		} );
		
		socket.on( 'job:new', function( data ){
			var job = JSON.parse( data );
			LOGGER.info( 'New job "' + job.name + '".' );
			// TODO: Send Joules that need saving to Banzai
	//		job.joules.forEach( function( joule ){
	//			if( joule.func !== undefined ){
	//				LOGGER.debug( 'Raw joule.' );
	//				LOGGER.debug( joule.func );
	//				var func = eval( "(" + joule.func + ")" );
	//				
	//				func( "inputs", "outputs", "other" );
	//			}
	//		} );
		} );
		
		socket.on( 'job:start', function( data ){
			var job = JSON.parse( data );
			LOGGER.info( 'Start job "' + job.name + '".' );
			// TODO: Schedule Job
			// TODO: Run Job
		} );
		
		socket.on( 'disconnect', function( ){
			connection_manager.disconnect( ip_address );
		} );
	} );
	
	LOGGER.info( 'Listening on port ' + config.get( 'shenzi.port' ) + '.' );
	io.listen( config.get( 'shenzi.port' ) );
}

module.exports = Shenzi;
