
function Job( crocuta, name ){
	
	var LOGGER = require( './utils/logger' )( 'ALL', 'Job:' + name );
	var joules = [];
	var sent = false;
	
	//TODO: remove
	sent = sent;
	
	this.joule = function( unit ){
		
		if( typeof unit === 'function' ){
			LOGGER.debug( 'Added raw joule to ' + name + ' job.' );
			joules.push( {
				func: unit.toString()
			} );
		}
		
		return this;
	};
	
	this.send = function( input, callback ){
		if( !crocuta.isReady() ){
			LOGGER.error( 'Can not send job to Crocuta.  Server is not ready.' );
			throw new Error( 'Can not send job to Crocuta.  Server is not ready.' );
		}
		
		LOGGER.info( 'Sending ' + name + ' job to Crocuta.' );
		crocuta._socket.emit( 'new job', JSON.stringify( { name: name, joules: joules } ) );
		
		if( input !== undefined ){
			this.start( input, callback );
		}
		
		return this;
	};
	
	this.start = function( input, callback ){
		if( !crocuta.isReady() ){
			LOGGER.error( 'Can not send job to Crocuta.  Server is not ready.' );
			throw new Error( 'Can not send job to Crocuta.  Server is not ready.' );
		}
		
		LOGGER.info( 'Starting ' + name + ' job.' );
		
		input = input;
		callback = callback;
		
	};
	
	this.getName = function( ){
		return name;
	};
}

module.exports = Job;