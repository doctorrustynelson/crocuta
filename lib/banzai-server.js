var LOGGER = require( './utils/logger' )( 'ALL', 'banzai' );
var config = require( '../config/global.config.json' );

var ConnectionManager = require( './connection-manager' );
var connection_manager = new ConnectionManager();

var io = require( 'socket.io' )( );

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
	
	socket.on( 'disconnect', function( ){
		connection_manager.disconnect( ip_address );
	} );
} );

var shenzi_socket = io.connect( 'http://localhost:' + config.shenzi.port );

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

shenzi_socket.on( 'introduction', function( msg ){
	LOGGER.info( msg );
} );

shenzi_socket.on( 'err', function( msg ){
	LOGGER.error( msg );
} );

shenzi_socket.on( 'disconnect', function( ){
	LOGGER.warn( 'Disconnection' );
} );

shenzi_socket.on( '' );

LOGGER.info( 'Starting Banzai.' );
LOGGER.info( 'Listening on port ' + config.banzai.port + '.' );
LOGGER.info( 'Engine: ' + 'nodejs' );
LOGGER.info( 'Engine version: ' + process.version );
LOGGER.info( 'Archetecture: ' + process.arch );
LOGGER.info( 'Platform: ' + process.platform );
io.listen( config.banzai.port );