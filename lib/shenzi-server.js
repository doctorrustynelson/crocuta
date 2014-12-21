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
	var jobs = {};
	var uploads = {};
	var job_counter = 0;
	
	function stepJob( job_id, joule_index, result, input_key ){
		var job = jobs[ job_id ];
		var next_index = joule_index + 1;
		
		if( next_index < job.joules.length ){
			LOGGER.debug( 'Stepping Job ' + job.name + ' at joule #' + joule_index + '.' );
			
			var prev_joule_type = ( joule_index === -1 ? 'default' : job.joules[ joule_index ].type );
			var prev_joule_name = ( joule_index === -1 ? '' : job.joules[ joule_index ].name );
			var next_joule_type = job.joules[ next_index ].type;
			var next_joule_name = job.joules[ next_index ].name;
			var joule = job.joules[ next_index ];
			
			// TODO: move out of here we shouldn't be doing it every time we step.
			joule.index = next_index;
			
			if( prev_joule_type === 'o2m' && next_joule_type === 'm2o' ){
				LOGGER.error( 'Can not have an o2m joule immediatly followed by an m2o joule.' );
				throw new Error( 'Can not have an o2m joule immediatly followed by an m2o joule.' );
			}
			
			if( next_joule_name === 'key2loc' ){
				LOGGER.debug( 'key2loc Joule being called' );
				stepJob( job_id, next_index, result, input_key );
				return;
			}
			
			if( prev_joule_type === 'o2m' ){
				LOGGER.debug( 'Just Completed an o2m joule.' );
				
				job.parallel = [];
				job.aggrigated_result = {};
				
				Object.keys( result )
					.filter( function( key ){
						return result.hasOwnProperty( key );
					} ).forEach( function( key ){
						
						var worker = null;
						var input = null;
						var input_key = null;
						
						if( prev_joule_name === 'key2loc' ){
							console.log( result );
							var ip = result[ key ][ Math.floor( Math.random() * result[ key ].length ) ];
							worker = connection_manager.getEd( ip );
							input = key;
							input_key = key;
						} else {
							worker = connection_manager.getEd( );
							input = result[ key ];
							input_key = key;
						}
						
						job.parallel.push( input_key );
						
						worker.socket.emit( 
							'joule', 
							{ 
								joule: joule, 
								job_id: job_id, 
								input: input, 
								input_key: input_key
							}
						);
					} );
				return;
			}
			
			var worker = connection_manager.getEd( );
			
			if( next_joule_type === 'm2o' ){
				LOGGER.debug( 'About to Start an m2o joule.' );
				
				var index = job.parallel.indexOf( input_key );
				
				if( index === -1 ){
					LOGGER.error( 'Failed to find input key ' + input_key );
					throw new Error( 'Failed to find input key ' + input_key );
				} else {
					job.parallel.splice( index, 1 );
					job.aggrigated_result[ input_key ] = result;
					if( job.parallel.length === 0 ){
						worker.socket.emit( 'joule', { joule: joule, job_id: job_id, input: job.aggrigated_result, input_key: '' /* TODO */ } );
					} else {
						LOGGER.debug( 'Need to wait for more joules to complete.' );
					}
				}
				return;
			}
			
			LOGGER.debug( 'Running Joule regularly.' );
			worker.socket.emit( 'joule', { joule: joule, job_id: job_id, input: result, input_key: input_key } );
		} else {
			LOGGER.debug( 'Finished Job ' + job.name + '.' );
			
			jobs[ job_id ] = undefined;
			job.end = new Date();
			job.duration = job.end - job.start;
			job.client.emit( 'job:done', { success: true, name: job.name, id: job.name + ':' + job.id, result: result, duration: job.duration } );
		}
	}
	
	io.on( 'connection', function( socket ){
		var ip_address = socket.request.connection._peername.address + ':' + socket.request.connection._peername.port;
		
		LOGGER.debug( ip_address + ' # ' + 'Recieved connection.' );
		
		socket.on( 'register', function( data, callback ){
			LOGGER.info( ip_address + ' # ' + 'Registration request' );
			try{ 
				connection_manager.register( ip_address, data, socket );
				if( callback )
					callback( ip_address );
			} catch ( exception ){
				LOGGER.warn( ip_address + ' # ' + exception.message );
				socket.emit( 'err', exception.message );
				socket.disconnect();
			}
		} );
		
		socket.on( 'job:new', function( job ){
			LOGGER.info( 'New job "' + job.name + '".' );
			
			var compiled_job = [ ];
			
			job.joules.forEach( function( joule ){
				switch( joule.deploy ){
					case 'anonymous':
						compiled_job.push( joule );
						break;
					case 'saved-function':
						compiled_job.push( joule /* TODO */ );
						break;
					case 'named':
						compiled_job.push( joule /* TODO */ );
						break;
					default: 
						LOGGER.error( 'Unrecognized Joule deployment type ' + joule.deploy + '.' );
						break;
				}
			} );

			socket.emit( 'job:new-confirmation', { success: true, name: job.name, joules: compiled_job } );
		} );
		
		socket.on( 'job:start', function( job ){
			
			job.id = job_counter++;
			
			LOGGER.info( 'Starting job "' + job.name + '" with id ' + job.id + '.' );
			console.log( JSON.stringify( job, null, '\t' ) );
			
			job.start = new Date();
			job.client = socket;
			jobs[ job.id ] = job;
			
			socket.emit( 'job:starting', { success: true, id: job.name + ':' + job.id } );
			stepJob( job.id, -1, job.input, '' );
		} );
		
		socket.on( 'joule:complete', function( result ){
			LOGGER.info( 'Completed Joule ' + result.joule.name + ' for job ' + result.job_id + '.' );
			stepJob( result.job_id, result.joule.index, result.output, result.input_key );
		} );
		
		socket.on( 'upload:complete', function( result ){
			LOGGER.info( 'Upload of ' + result.key + ' complete.' );
			uploads[ result.key ].emit( 'upload:complete', result );
			delete uploads[ result.key ];
		} );
		
		socket.on( 'upload', function( file ){
			LOGGER.info( 'Uploading ' + file.key + '.' );
			uploads[ file.key ] = socket;
			var banzai = connection_manager.getBanzai();
			banzai.socket.emit( 'upload', file );
		} );
		
		socket.on( 'disconnect', function( ){
			try{
				connection_manager.disconnect( ip_address );
			} catch ( exception ) {
				LOGGER.warn( exception );
			}
		} );
	} );
	
	this.stop = function( ){
		LOGGER.info( 'Closing Shenzi.' );
		io.close( );
	};
	
	LOGGER.info( 'Listening on port ' + config.get( 'shenzi.port' ) + '.' );
	io.listen( config.get( 'shenzi.port' ) );
}

module.exports = Shenzi;
