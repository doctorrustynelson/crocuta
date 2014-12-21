/* Node unit quick reference:
 * 
 *	ok(value, [message]) 
 *		- Tests if value is a true value.
 *	equal(actual, expected, [message]) 
 *		- Tests shallow, coercive equality with the equal comparison operator ( == ).
 *	notEqual(actual, expected, [message]) 
 *		- Tests shallow, coercive non-equality with the not equal comparison operator ( != ).
 *	deepEqual(actual, expected, [message]) 
 *		- Tests for deep equality.
 *	notDeepEqual(actual, expected, [message]) 
 *		- Tests for any deep inequality.
 *	strictEqual(actual, expected, [message]) 
 *		- Tests strict equality, as determined by the strict equality operator ( === )
 *	notStrictEqual(actual, expected, [message]) 
 *		- Tests strict non-equality, as determined by the strict not equal operator ( !== )
 *	throws(block, [error], [message]) 
 *		- Expects block to throw an error.
 *	doesNotThrow(block, [error], [message]) 
 *		- Expects block not to throw an error.
 *	ifError(value) 
 *		- Tests if value is not a false value, throws if it is a true value.
 *	
 *	expect(amount) 
 *		- Specify how many assertions are expected to run within a test. 
 *	done() 
 *		- Finish the current test function, and move on to the next. ALL tests should call this!
 */

var path = require( 'path' );
var config = require( '../lib/utils/config' );
config.reinitialize( path.resolve( __dirname, './config/test.config.json' ) );

var Shenzi = require( '../lib/shenzi-server.js' );
var Banzai = require( '../lib/banzai-server.js' );
var Ed = require( '../lib/ed-server.js' );

var shenzi = null;
var banzai = null;
var ed = null;

module.exports.integrationTests = {
	
	setUp: function( callback ){
		shenzi = new Shenzi( );
		banzai = new Banzai( );
		ed = new Ed( );
		callback( );
	},
	
	tearDown: function( callback ){
		shenzi.stop();
		banzai.stop();
		ed.stop();
		callback( );
	},
		
	available: function( unit ){
		var Crocuta = require( '../lib/client' );
		var crocuta = new Crocuta( );
		
		var timeout = setTimeout( function( ){
			unit.ok( false, 'Test Timed Out.' );
			crocuta.stop();
			unit.done();
		}, 10000 );
		
		
		var job = crocuta.createJob( 'hello world' ).joule( function( /* input, output, reporter */ ){
			/* global fileSystem */
			/* global done */
			
			console.log( typeof fileSystem );
			console.log( typeof LOGGER );
			
			done( { 
				fileSystem: typeof fileSystem,
				LOGGER: typeof LOGGER
			} );
		} );
	
		crocuta.onReady( function( ){
			unit.ok( true, 'onReady fired.' );
			job.send( function( err, job ){
				unit.ok( !err, 'No error on send' );
				job.start( undefined, function( err, result ){
					unit.deepEqual( result, {
						fileSystem: 'object',
						LOGGER: 'undefined'
					}, 'Job returned correct result.' );
					clearTimeout( timeout );
					crocuta.stop();
					unit.done( );
				} );
			} );
		} );
	}
};

