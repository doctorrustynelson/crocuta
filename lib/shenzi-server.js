/**
 * New node file
 */

var LOGGER = require( './utils/logger' )( 'ALL', 'shenzi' );
var io = require( 'socket.io' )( );
var config = require( '../config/global.config.json' );

var ConnectionManager = require( './connection-manager' );
var connection_manager = new ConnectionManager();

io.on( 'connection', function( socket ){
	var ip_address = socket.request.connection._peername.address + ':' + socket.request.connection._peername.port;
	
	LOGGER.debug( ip_address + ' # ' + 'Recieved connection.' );
	
	// Send an introduction message with anything needed to confirm the connection
	socket.emit( 'introduction', { node_type: 'shenzi' } );
	
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
		// TODO: Forward job to banzai
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
		// TODO: Schedule job
	} );
	
	socket.on( 'disconnect', function( ){
		connection_manager.disconnect( ip_address );
	} );
} );

LOGGER.info( 'Listening on port ' + config.shenzi.port + '.' );
io.listen( config.shenzi.port );