/**
 * Configuration Manager
 */

var fs = require( 'fs' );

module.exports = function( default_location ){
	var CROCUTA_CONFIG = process.env.CROCUTA_CONFIG || default_location;
	
	return JSON.parse( fs.readFileSync( CROCUTA_CONFIG ) );
};