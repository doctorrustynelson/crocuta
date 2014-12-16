/**
 * New node file
 */

var Shenzi = require( '../lib/shenzi-server.js' );
var Banzai = require( '../lib/banzai-server.js' );
var Ed = require( '../lib/ed-server.js' );

var shenzi = null;
var banzai = null;
var ed = null;

module.exports.setUp = function( callback ){
	shenzi = new Shenzi( );
	banzai = new Banzai( );
	ed = new Ed( );
	callback( );
};

module.exports.tearDown = function( callback ){
	ed.stop( );
	banzai.stop( );
	shenzi.stop( );
	callback( );
};

module.exports.simpleTest = function( unit ){
	
	setTimeout( function( ){
		unit.done( );
	}, 2000 );
};