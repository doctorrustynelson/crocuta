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
	var job_counter = 0;
	
	function stepJob( job_id, joule_index, result ){
		var job = jobs[ job_id ];
		var next_index = joule_index + 1;
		
		if( next_index < job.joules.length ){
			LOGGER.debug( 'Stepping Job ' + job.name + ' at joule #' + joule_index + '.' );
			
			var worker = connection_manager.getEd( );
			var joule = job.joules[ next_index ];
			
			// TODO: move out of here we shouldn't be doing it every time we step.
			joule.index = next_index;
			
			worker.socket.emit( 'joule', { joule: joule, job_id: job_id, input: result } );
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
		
		socket.on( 'job:new', function( job ){
			LOGGER.info( 'New job "' + job.name + '".' );
			
			var compiled_job = [ ];
			
			job.joules.forEach( function( joule ){
				switch( joule.deploy ){
					case 'anonymous':
						compiled_job.push( joule );
						break;
					case 'saved-function':
						compiled_job.push( {} /* TODO */ );
						break;
					case 'named':
						compiled_job.push( {} /* TODO */ );
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
			console.log( job );
			
			job.start = new Date();
			job.client = socket;
			jobs[ job.id ] = job;
			
			socket.emit( 'job:starting', { success: true, id: job.name + ':' + job.id } );
			stepJob( job.id, -1, job.input );
		} );
		
		socket.on( 'joule:complete', function( result ){
			LOGGER.info( 'Completed Joule ' + result.joule.name + ' for job ' + result.job_id + '.' );
			stepJob( result.job_id, result.joule.index, result.output );
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
