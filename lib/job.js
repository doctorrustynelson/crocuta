
function Job( crocuta, name ){
	
	var LOGGER = require( './utils/logger' )( 'ALL', 'Job:' + name );
	var joules = [];
	//var sent = false;
	
	this.joule = function( unit, joule_name ){
		
		switch( typeof unit ){
			case 'function': 
				if( joule_name !== undefined ){
					LOGGER.debug( 'Added saved-function joule ' + joule_name + ' to ' + name + ' job.' );
					joules.push( {
						type: 'default',
						deploy: 'saved-function',
						name: joule_name,
						func: unit.toString()
					} );
				} else {
					LOGGER.debug( 'Added anonymous joule to ' + name + ' job.' );
					joules.push( {
						type: 'default',
						deploy: 'anonymous',
						func: unit.toString()
					} );
				}
				break;
			case 'string': 
				LOGGER.debug( 'Added named joule ' + unit + ' to ' + name + ' job.' );
				joules.push( {
					type: 'default',
					deploy: 'named',
					name: unit
				} );
				break;
			default: 
				LOGGER.error( 'Can not determine type of joule to add to the job.' );
				break;
		}
		
		return this;
	};
	
	this.o2mjoule = function( unit, joule_name ){
		
		switch( typeof unit ){
			case 'function': 
				if( joule_name !== undefined ){
					LOGGER.debug( 'Added saved-function joule ' + joule_name + ' to ' + name + ' job.' );
					joules.push( {
						type: 'o2m',
						deploy: 'saved-function',
						name: joule_name,
						func: unit.toString()
					} );
				} else {
					LOGGER.debug( 'Added anonymous joule to ' + name + ' job.' );
					joules.push( {
						type: 'o2m',
						deploy: 'anonymous',
						func: unit.toString()
					} );
				}
				break;
			case 'string': 
				LOGGER.debug( 'Added named joule ' + unit + ' to ' + name + ' job.' );
				joules.push( {
					type: 'o2m',
					deploy: 'named',
					name: unit
				} );
				break;
			default: 
				LOGGER.error( 'Can not determine type of joule to add to the job.' );
				break;
		}
		
		return this;
	};
	
	this.m2ojoule = function( unit, joule_name ){
		
		switch( typeof unit ){
			case 'function': 
				if( joule_name !== undefined ){
					LOGGER.debug( 'Added saved-function joule ' + joule_name + ' to ' + name + ' job.' );
					joules.push( {
						type: 'm2o',
						deploy: 'saved-function',
						name: joule_name,
						func: unit.toString()
					} );
				} else {
					LOGGER.debug( 'Added anonymous joule to ' + name + ' job.' );
					joules.push( {
						type: 'm2o',
						deploy: 'anonymous',
						func: unit.toString()
					} );
				}
				break;
			case 'string': 
				LOGGER.debug( 'Added named joule ' + unit + ' to ' + name + ' job.' );
				joules.push( {
					type: 'm2o',
					deploy: 'named',
					name: unit
				} );
				break;
			default: 
				LOGGER.error( 'Can not determine type of joule to add to the job.' );
				break;
		}
		
		return this;
	};
	
	this.send = function( callback ){
		if( !crocuta.isReady() ){
			LOGGER.error( 'Can not send job to Crocuta.  Server is not ready.' );
			throw new Error( 'Can not send job to Crocuta.  Server is not ready.' );
		}
		
		LOGGER.info( 'Sending ' + name + ' job to Crocuta.' );
		crocuta._socket.emit( 'job:new', { name: name, joules: joules } );

		this.new_callback = callback;
	};
	
	this.start = function( input, callback ){
		if( !crocuta.isReady() ){
			LOGGER.error( 'Can not send job to Crocuta.  Server is not ready.' );
			throw new Error( 'Can not send job to Crocuta.  Server is not ready.' );
		}
		
		// TODO check sent.
		
		LOGGER.info( 'Starting ' + name + ' job.' );
		
		this.run_callback = callback;
		crocuta._socket.emit( 'job:start', { name: name, joules: this.compiled, input: input } );
	};
	
	this.getName = function( ){
		return name;
	};
}

module.exports = Job;