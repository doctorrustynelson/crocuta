
var path = require( 'path' );
if( !process.env.CROCUTA_CONFIG ){
	process.env.CROCUTA_CONFIG = path.resolve( __dirname, '..', 'config', 'local.config.json' );
}

var LOGGER = require( './utils/logger' )( 'ALL', 'crocuta' );
var Job = require( './job' );
var config = require( './utils/config' );

module.exports = Client;

function Client( ){
	if ( !( this instanceof Client ) ) 
		return new Client( );
	
	var socket = require( 'socket.io-client' )( 'http://' + config.get( 'shenzi.host' ) + ':' + config.get( 'shenzi.port' ), { multiplex: false } );
	var ready = false;
	var jobs = { };
	var uploads = { };

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
	
	socket.on( 'job:new-confirmation', function( result ){
		if( result.success ){
			LOGGER.debug( 'New Job Registered ' + result.name + '.' );
			jobs[ result.name ].compiled = result.joules;
		} else {
			LOGGER.error( 'Failed to register new Job ' + result.name + '.' );
		}
		
		if( jobs[ result.name ].new_callback ){
			jobs[ result.name ].new_callback( 
				( result.success ? undefined : result.msg ),
				jobs[ result.name ]
			);
		}
	} );
	
	socket.on( 'job:done', function( result ){
		console.log( result );
		if( result.success ){
			LOGGER.debug( 'Job Complete ' + result.name + '.' );
		} else {
			LOGGER.error( 'Failed durring Job ' + result.name + '.' );
		}
		
		if( jobs[ result.name ].run_callback ){
			jobs[ result.name ].run_callback( 
				( result.success ? undefined : result.msg ),
				result.result
			);
		}
	} );
	
	socket.on( 'upload:complete', function( result ){
		if( result.success ){
			LOGGER.debug( 'Upload of ' + result.key + ' complete.' );
		} else {
			LOGGER.error( 'Failed during upload of ' + result.key + '.' );
		}
		
		uploads[ result.key ]( ( result.success ? undefined : result.msg ) );
		delete uploads[ result.key ];
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
		jobs[ name ] = new Job( this, name );
		return jobs[ name ];
	};
	
	this.upload = function( key, contents, callback ){
		uploads[ key ] = callback;
		socket.emit( 'upload', {
			key: key,
			type: 'text',
			value: contents
		} );
	};
	
	this.stop = function( ){
		LOGGER.info( 'Closing Client.' );
		socket.disconnect( true );
	};
	
	this._socket = socket;
}