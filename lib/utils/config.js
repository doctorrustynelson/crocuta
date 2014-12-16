/**
 * Configuration Manager
 */

var fs = require( 'fs' );
var path = require( 'path' );
var extend = require( 'extend' );

var DEFAULT_CONFIG = path.resolve( __dirname, '../../config/global.config.json' );
var config = JSON.parse( fs.readFileSync( DEFAULT_CONFIG ) );

if( process.env.CROCUTA_CONFIG && process.env.CROCUTA_CONFIG !== 'false' && process.env.CROCUTA_CONFIG !== '' ){
	extend( 
		true, 
		config,
		JSON.parse( fs.readFileSync( process.env.CROCUTA_CONFIG ) )
	);
}
	
module.exports.get = function( key ){
	var value = config;
	
	if( key === undefined ){
		return value;
	}
	
	var levels = key.split( '.' );
	var new_key = '';
	
	levels.forEach( function( level, index ){
		new_key = new_key + level;
		
		if( value === undefined && index < ( levels.length - 1 ) ){
			throw new Error( new_key + ' is undefined and therefore can not read ' + key + ' in the config.' );
		}
		
		value = value[ level ];
		new_key = new_key + '.';
	} );
	
	if( typeof value === 'object')
		value = extend( {}, value );
	return value;
};

module.exports.reinitialize = function( config_location ){
	config = JSON.parse( fs.readFileSync( DEFAULT_CONFIG ) );
	
	// Override default with CROCUTA_CONFIG
	if( process.env.CROCUTA_CONFIG && process.env.CROCUTA_CONFIG !== 'false' && process.env.CROCUTA_CONFIG !== '' ){
		extend( 
			true,
			config,
			JSON.parse( fs.readFileSync( process.env.CROCUTA_CONFIG ) )
		);
	}
	
	// Override default with provided location
	if( config_location ){
		extend( 
			true,
			config,
			JSON.parse( fs.readFileSync( config_location ) )
		);
	}
};