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
var DataDirector = require( '../lib/data-director' );
var config = require( '../lib/utils/config' );
config.reinitialize( path.resolve( __dirname, './config/test.config.json' ) );


module.exports.getStateTests = {
	
	badKey: function( unit ){
		var director = new DataDirector( );
		
		unit.throws( function( ) { 
			director.getState( 'hello.world' );
		}, undefined, 'Bad key throws an Error.' );
		
		unit.throws( function( ) { 
			director.getState( 'hello' );
		}, undefined, 'Bad key throws an Error.' );
		
		unit.done();
	},
	
	keyNotALeaf: function( unit ){
		var director = new DataDirector( );
		
		director.startStore( 'hello.world.from.crocuta', 'loc1' );
		
		unit.throws( function( ){
			director.getState( 'hello' );
		}, undefined, 'Non leaf key throws an Error.' );
		
		unit.throws( function( ){
			director.getState( 'hello.world' );
		}, undefined, 'Non leaf key throws an Error.' );
		
		unit.throws( function( ){
			director.getState( 'hello.world.from' );
		}, undefined, 'Non leaf key throws an Error.' );
		
		unit.done();
	}
	
};

module.exports.getLocationsTests = {
	badKey: function( unit ){
		var director = new DataDirector( );
		
		unit.throws( function( ) { 
			director.getLocations( 'hello.world' );
		}, undefined, 'Bad key throws an Error.' );
		
		unit.throws( function( ) { 
			director.getLocations( 'hello' );
		}, undefined, 'Bad key throws an Error.' );
		
		unit.done();
	},
	
	keyNotALeaf: function( unit ){
		var director = new DataDirector( );
		
		director.startStore( 'hello.world.from.crocuta', 'loc1' );
		
		unit.throws( function( ){
			director.getLocations( 'hello' );
		}, undefined, 'Non leaf key throws an Error.' );
		
		unit.throws( function( ){
			director.getLocations( 'hello.world' );
		}, undefined, 'Non leaf key throws an Error.' );
		
		unit.throws( function( ){
			director.getLocations( 'hello.world.from' );
		}, undefined, 'Non leaf key throws an Error.' );
		
		unit.done();
	}
};

module.exports.startStoreTests = {
	
	simpleStart: function( unit ){
		var director = new DataDirector( );
		
		director.startStore( 'hello.world.from.crocuta', 'loc1' );
		
		unit.equal( director.getState( 'hello.world.from.crocuta' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'hello.world.from.crocuta' ), [ 'loc1' ], 'New startStore has locations.' );
		unit.done();
	},
	
	multiStart: function( unit ){
		var director = new DataDirector( );
		
		director.startStore( 'hello.world.from.crocuta', 'loc1' );
		
		unit.equal( director.getState( 'hello.world.from.crocuta' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'hello.world.from.crocuta' ), [ 'loc1' ], 'New startStore has locations.' );
		
		director.startStore( 'hello.world.from.crocuta', 'loc2' );
		
		unit.equal( director.getState( 'hello.world.from.crocuta' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'hello.world.from.crocuta' ).sort(), [ 'loc1', 'loc2' ], 'New startStore has locations.' );
		
		unit.done();
	},
	
	peerStart: function( unit ){
		var director = new DataDirector( );
		
		director.startStore( 'hello.world.from.crocuta', 'loc1' );
		director.startStore( 'hello.world.from.rusty', 'loc1' );
		
		unit.equal( director.getState( 'hello.world.from.crocuta' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'hello.world.from.crocuta' ), [ 'loc1' ], 'New startStore has locations.' );
		unit.equal( director.getState( 'hello.world.from.rusty' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'hello.world.from.rusty' ), [ 'loc1' ], 'New startStore has locations.' );
		unit.done();
	},
	
	manyStarts: function( unit ){
		var director = new DataDirector( );
		
		director.startStore( 'hello.world.from.crocuta', 'loc1' );
		director.startStore( 'hello.world.from.rusty', 'loc1' );
		director.startStore( 'hello.world.to', 'loc1' );
		director.startStore( 'another.tree', 'loc1' );
		director.startStore( 'another.entry', 'loc1' );
		
		unit.equal( director.getState( 'hello.world.from.crocuta' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'hello.world.from.crocuta' ), [ 'loc1' ], 'New startStore has locations.' );
		unit.equal( director.getState( 'hello.world.from.rusty' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'hello.world.from.rusty' ), [ 'loc1' ], 'New startStore has locations.' );
		unit.equal( director.getState( 'hello.world.to' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'hello.world.to' ), [ 'loc1' ], 'New startStore has locations.' );
		unit.equal( director.getState( 'another.tree' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'another.tree' ), [ 'loc1' ], 'New startStore has locations.' );
		unit.equal( director.getState( 'another.entry' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'another.entry' ), [ 'loc1' ], 'New startStore has locations.' );
		unit.done();
	},
	
	startChildOfStarted: function( unit ){
		var director = new DataDirector( );
		
		director.startStore( 'hello.world.to', 'loc1' );
		
		unit.equal( director.getState( 'hello.world.to' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'hello.world.to' ), [ 'loc1' ], 'New startStore has locations.' );

		unit.throws( function( ){
			director.startStore( 'hello.world.to.crocuta' );
		}, undefined, 'Child of previous store should throw an Error.' );
		
		unit.equal( director.getState( 'hello.world.to' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'hello.world.to' ), [ 'loc1' ], 'New startStore has locations.' );
		unit.done();
	},
	
	startParentOfStarted: function( unit ){
		var director = new DataDirector( );
		
		director.startStore( 'hello.world.to', 'loc1' );
		
		unit.equal( director.getState( 'hello.world.to' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'hello.world.to' ), [ 'loc1' ], 'New startStore has locations.' );

		unit.throws( function( ){
			director.startStore( 'hello' );
		}, undefined, 'Parent of previous store should throw an Error.' );
		
		unit.equal( director.getState( 'hello.world.to' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'hello.world.to' ), [ 'loc1' ], 'New startStore has locations.' );
		unit.done();
	}
};

module.exports.finishStoreTests = {
		
	simpleFinish: function( unit ){
		var director = new DataDirector( );
		
		director.startStore( 'hello.world.from.crocuta', 'loc1' );
		
		unit.equal( director.getState( 'hello.world.from.crocuta' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'hello.world.from.crocuta' ), [ 'loc1' ], 'New startStore has locations.' );
		
		director.finishStore( 'hello.world.from.crocuta', 'loc1' );
		
		unit.equal( director.getState( 'hello.world.from.crocuta' ), 'stored', 'Store Complete.' );
		unit.deepEqual( director.getLocations( 'hello.world.from.crocuta' ), [ 'loc1' ], 'Completed store has locations.' );
		
		unit.done();
	},
	
	finishChildOfStarted: function( unit ){
		var director = new DataDirector( );
		
		director.startStore( 'hello.world.to', 'loc1' );
		
		unit.equal( director.getState( 'hello.world.to' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'hello.world.to' ), [ 'loc1' ], 'New startStore has locations.' );

		unit.throws( function( ){
			director.finishStore( 'hello.world.to.crocuta' );
		}, undefined, 'Child of previous store should throw an Error.' );
		
		unit.equal( director.getState( 'hello.world.to' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'hello.world.to' ), [ 'loc1' ], 'New startStore has locations.' );
		unit.done();
	},
	
	finishParentOfStarted: function( unit ){
		var director = new DataDirector( );
		
		director.startStore( 'hello.world.to', 'loc1' );
		
		unit.equal( director.getState( 'hello.world.to' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'hello.world.to' ), [ 'loc1' ], 'New startStore has locations.' );

		unit.throws( function( ){
			director.finishStore( 'hello' );
		}, undefined, 'Parent of previous store should throw an Error.' );
		
		unit.equal( director.getState( 'hello.world.to' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'hello.world.to' ), [ 'loc1' ], 'New startStore has locations.' );
		unit.done();
	}
};

module.exports.failedStoreTests = {
		
	simpleFail: function( unit ){
		var director = new DataDirector( );
		
		director.startStore( 'hello.world.from.crocuta', 'loc1' );
		
		unit.equal( director.getState( 'hello.world.from.crocuta' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'hello.world.from.crocuta' ), [ 'loc1' ], 'New startStore has locations.' );
		
		director.failedStore( 'hello.world.from.crocuta', 'loc1' );
		
		unit.equal( director.getState( 'hello.world.from.crocuta' ), 'failed', 'Failed State.' );
		unit.deepEqual( director.getLocations( 'hello.world.from.crocuta' ), [ 'loc1' ], 'Failed store still has locations.' );
		
		unit.done();
	},
	
	failChildOfStarted: function( unit ){
		var director = new DataDirector( );
		
		director.startStore( 'hello.world.to', 'loc1' );
		
		unit.equal( director.getState( 'hello.world.to' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'hello.world.to' ), [ 'loc1' ], 'New startStore has locations.' );

		unit.throws( function( ){
			director.failedStore( 'hello.world.to.crocuta' );
		}, undefined, 'Child of previous store should throw an Error.' );
		
		unit.equal( director.getState( 'hello.world.to' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'hello.world.to' ), [ 'loc1' ], 'New startStore has locations.' );
		unit.done();
	},
	
	failParentOfStarted: function( unit ){
		var director = new DataDirector( );
		
		director.startStore( 'hello.world.to', 'loc1' );
		
		unit.equal( director.getState( 'hello.world.to' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'hello.world.to' ), [ 'loc1' ], 'New startStore has locations.' );

		unit.throws( function( ){
			director.failedStore( 'hello' );
		}, undefined, 'Parent of previous store should throw an Error.' );
		
		unit.equal( director.getState( 'hello.world.to' ), 'pending', 'New startStore is pending.' );
		unit.deepEqual( director.getLocations( 'hello.world.to' ), [ 'loc1' ], 'New startStore has locations.' );
		unit.done();
	}
};

module.exports.registerLocationTests = {
		
	simpleRegistor: function( unit ){
		var director = new DataDirector( );
		
		director.registerLocation( 'loc1', [ 'hello.world.from.crocuta', 'hello.world.from.rusty' ] );
		
		unit.equal( director.getState( 'hello.world.from.crocuta' ), 'stored', 'Store Complete.' );
		unit.deepEqual( director.getLocations( 'hello.world.from.crocuta' ), [ 'loc1' ], 'Completed store has locations.' );
		
		unit.equal( director.getState( 'hello.world.from.rusty' ), 'stored', 'Store Complete.' );
		unit.deepEqual( director.getLocations( 'hello.world.from.rusty' ), [ 'loc1' ], 'Completed store has locations.' );
		
		unit.done();
	}
};

module.exports.lostLocationTests = {
		
	simpleLost: function( unit ){
		var director = new DataDirector( );
		
		director.registerLocation( 'loc1', [ 'hello.world.from.crocuta', 'hello.world.from.rusty' ] );
		
		unit.equal( director.getState( 'hello.world.from.crocuta' ), 'stored', 'Store Complete.' );
		unit.deepEqual( director.getLocations( 'hello.world.from.crocuta' ), [ 'loc1' ], 'Completed store has locations.' );
		
		unit.equal( director.getState( 'hello.world.from.rusty' ), 'stored', 'Store Complete.' );
		unit.deepEqual( director.getLocations( 'hello.world.from.rusty' ), [ 'loc1' ], 'Completed store has locations.' );
		
		director.lostLocation( 'loc1' );
		
		unit.throws( function( ) { 
			director.getState( 'hello.world.from.crocuta', 'loc1' );
		}, undefined, 'Lost key throws an Error.' );
		
		unit.throws( function( ) { 
			director.getState( 'hello.world.from.rusty', 'loc1' );
		}, undefined, 'Lost key throws an Error.' );
		
		unit.done();
	}
};
