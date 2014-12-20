
var os = require( 'os' );
var vm = require( 'vm' );
var LOGGER = require( './utils/logger' )( 'ALL', 'ed' );
var DataManager = require( './data-manager' );
var config = require( './utils/config' );

function Ed( ){
	
	/*********************************************************************************************************************/
	/*                                               Shenzi Communication                                                */
	/*********************************************************************************************************************/
	
	var shenzi_socket = require( 'socket.io-client' )( 'http://' + config.get( 'shenzi.host' ) + ':' + config.get( 'shenzi.port' ), config.get( 'ed.connection.options' ) );
	
	shenzi_socket.on( 'connect', function( ){
		LOGGER.debug( 'Established Connection to Shenzi.' );
		
		shenzi_socket.emit( 'register', {
			type: 'ed',
			engine: 'nodejs',
			engine_version: process.version,
			arch: process.arch,
			platform: process.platform,
			memory: os.totalmem(),
			cpus: os.cpus()
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
		// TODO: handle when banzai comes up somewhere else
	} );
	
	// Shenzi Joule request
	shenzi_socket.on( 'joule', function( step ){
		var joule = step.joule;
		LOGGER.debug( 'Recieved Joule' );
		LOGGER.debug( JSON.stringify( step, null, '\t' ) );
		
		switch( joule.deploy ){
			case 'anonymous':
				LOGGER.debug( 'Running Anonymous Joule.' );
				LOGGER.debug( joule.func );
				
				var fileSystem = { 'Hello': true };
				var context = vm.createContext( {
					fileSystem: fileSystem,
					input: step.input,
					console: console
				} );
				
				//var func = eval( '(' + joule.func + ')' );
				//var result = func( step.input, { /* TODO */ }, 'other' );
				
				vm.runInContext( '(' + joule.func + ')()', context, joule.name + '.vm' );
				
				var result = context.result;
				
				step.success = true;
				step.output = result;
				shenzi_socket.emit( 'joule:complete', step );
				break;
			case 'named':
				// TODO
				break;
			default: 
				shenzi_socket.emit( 'joule:complete', { success: false } );
				shenzi_socket.emit( 'err', { 'type': 'joule', 'msg': 'Can not run Joule of deployment type ' + joule.deploy + '.' } );
				break;
		}
		
	} );

	/*********************************************************************************************************************/
	/*                                               Banzai Communication                                                */
	/*********************************************************************************************************************/
	
	var banzai_socket = require( 'socket.io-client' )( 'http://' + config.get( 'banzai.host' ) + ':' + config.get( 'banzai.port' ), config.get( 'ed.connection.options' ) );
	var data_manager = new DataManager( );
	
	banzai_socket.on( 'connect', function( ){
		LOGGER.debug( 'Established Connection to Banzai.' );
			
		banzai_socket.emit( 'register', {
			type: 'ed',
			engine: 'nodejs',
			datakeys: data_manager.listKeys( )
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
	
	banzai_socket.on( 'hold-data', function( metadata ){
		LOGGER.debug( 'Recieved Hold Data Request: ' + metadata.key );
		switch( metadata.type ){
			case 'text': 
				data_manager.store( metadata.key, metadata.value, function( error ){
					if( error ){
						LOGGER.error( 'Failed to hold data for key ' + metadata.key + ' with type ' + metadata.type + '.' );
						banzai_socket.emit( 'hold-confirmation', { success: false, key: metadata.key, message: error } );
					} else {
						banzai_socket.emit( 'hold-confirmation', { success: true, key: metadata.key, } );
					}
				} );
				break;
			default:
				LOGGER.error( 'Unrecognized data type: ' + metadata.type );
				banzai_socket.emit( 'hold-confirmation', { success: false, key: metadata.key, message: 'Unrecognized data type: ' + metadata.type } );
				banzai_socket.emit( 'err', { message: 'Unrecognized data type: ' + metadata.type } );
				break;
		}
	} );
	
	banzai_socket.on( 'lose-data', function( metadata ){
		LOGGER.debug( 'Recieved Lose Data Request: ' + metadata.key );
		data_manager.lose( metadata.key, function( error ){
			if( error ){
				LOGGER.error( 'Failed to lose data for key ' + metadata.key + '.' );
				banzai_socket.emit( 'lose-confirmation', { success: false, key: metadata.key, message: error } );
			} else {
				banzai_socket.emit( 'lose-confirmation', { success: true, key: metadata.key } );
			}
		} );
	} );
	
	banzai_socket.on( 'get-data', function( metadata ){
		LOGGER.debug( 'Recieved Get Data Request: ' + metadata.key );
		data_manager.get( metadata.key, function( error, data ){
			if( error ){
				LOGGER.error( 'Failed to get data for key ' + metadata.key + '.' );
				banzai_socket.emit( 'get-confirmation', { success: false, key: metadata.key, message: error } );
			} else {
				banzai_socket.emit( 'get-confirmation', { success: true, key: metadata.key, data: data.toString() } );
			}
		} );
	} );
	
	banzai_socket.on( 'list-data', function( ){
		LOGGER.debug( 'Recieved List Data Request' );
		banzai_socket.emit( 'list-confirmation', { success: true, keys: data_manager.listKeys( ) } );
	} );
	
	// Banzai Spawned New Shenzi
	banzai_socket.on( 'shenzi moved', function( ){
		LOGGER.debug( 'Shenzi has moved' );
		//TODO: handle when shenzi comes up somewhere else
	} );

	/*********************************************************************************************************************/
	/*                                                      Utility                                                      */
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
	LOGGER.info( 'Memory: ' + Math.floor( os.totalmem() / ( 1024 * 1024 ) ) + ' MB' );
	LOGGER.info( 'Number of Threads: ' + os.cpus().length );
}

module.exports = Ed;