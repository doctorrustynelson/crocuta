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
var config = require( '../lib/utils/config.js' );

module.exports.getTests = {
	
	globalOnly: function( unit ){
		config.reinitialize( );
		
		unit.equal( config.get( 'shenzi.port' ), 2102, 'Shenzi default port.' );
		unit.equal( config.get( 'banzai.port' ), 2103, 'Banzai default port.' );
		unit.done();
	},
	
	badKey: function( unit ){
		config.reinitialize( );
		
		unit.throws( function( ){
			config.get( 'shenzi.missing.key' );
		}, undefined, 'Bad key throws an error.' );
		
		unit.done();
	},
	
	keyLeadingToUndefined: function( unit ){
		config.reinitialize( );
		
		unit.doesNotThrow( function( ){
			unit.strictEqual( config.get( 'shenzi.missing' ), undefined, 'Undefined if key terminates in undefined.' );
		}, undefined, 'Does not throw an error if key could exist.' );
		
		unit.done();
	},
	
	emptyKey: function( unit ){
		config.reinitialize( );
		
		unit.doesNotThrow( function( ){
			unit.equal( typeof config.get( ), 'object', 'Empty key returns everything.' );
		}, undefined, 'Does not throw an error if key is empty.' );
		
		unit.done();
	}
};

module.exports.reinitializeTests = {
	
	overrideGlobalsWithExplicitPath: function( unit ){
		config.reinitialize( );
		
		unit.strictEqual( config.get( 'ed.data.location' ), undefined, 'Initial ed.data.location is undefined.' );
		
		config.reinitialize( path.resolve( __dirname, './config/test.config.json' ) );
		
		unit.notStrictEqual( config.get( 'ed.data.location' ), undefined, 'Overriden ed.data.location is not undefined.' );
		unit.done();
	},
	
	overrideGlobalsWithCROCUTA_CONFIG: function( unit ){
		config.reinitialize( );
		
		unit.strictEqual( config.get( 'ed.data.location' ), undefined, 'Initial ed.data.location is undefined.' );
		
		process.env.CROCUTA_CONFIG = path.resolve( __dirname, './config/test.config.json' );
		config.reinitialize( );
		
		unit.notStrictEqual( config.get( 'ed.data.location' ), undefined, 'Overriden ed.data.location is not undefined.' );
		unit.done();
	}
};


