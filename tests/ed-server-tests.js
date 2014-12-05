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

var Ed = require( '../lib/ed-server.js' );
var Server = require( 'socket.io' );

module.exports.initialConnectionTests = {
	
	plainConnection: function( unit ){
		unit.expect(2);
		
		var test_shenzi = new Server( );
		var test_banzai = new Server( );
		
		test_shenzi.on( 'connection', function( /* socket */ ){
			unit.ok( true );
		} );
		
		test_banzai.on( 'connection', function( /* socket */ ){
			unit.ok( true );
		} );
		
		test_shenzi.listen( 2102 ); 
		test_banzai.listen( 2103 ); 
		
		var ed_server = new Ed( );
		
		setTimeout( function( ){
			ed_server.stop( );			
			test_shenzi.close( );
			test_banzai.close( );
			unit.done( );
		}, 5000 );
	},
	
	registationAutomaticlyAfterConnection: function( unit ){
		unit.expect(4);
		
		var test_shenzi = new Server( );
		var test_banzai = new Server( );
		
		test_shenzi.on( 'connection', function( socket ){
			unit.ok( true );
			socket.on( 'register', function( /* data */ ){
				unit.ok( true );
			} );
		} );
		
		test_banzai.on( 'connection', function( socket ){
			unit.ok( true );
			socket.on( 'register', function( /* data */ ){
				unit.ok( true );
			} );
		} );
		
		test_shenzi.listen( 2102 ); 
		test_banzai.listen( 2103 ); 
		
		var ed_server = new Ed( );
		
		setTimeout( function( ){
			ed_server.stop( );
			test_shenzi.close( );
			test_banzai.close( );
			unit.done( );
		}, 5000 );
	}
};

module.exports.stopTests = {
	stopThenNoReattemptsToConnect: function( unit ){
		unit.expect(2);
		
		var test_shenzi = new Server( );
		var test_banzai = new Server( );
		
		test_shenzi.on( 'connection', function( /* socket */ ){
			unit.ok( true );
		} );
		
		test_banzai.on( 'connection', function( /* socket */ ){
			unit.ok( true );
		} );
		
		test_shenzi.listen( 2102 ); 
		test_banzai.listen( 2103 ); 
		
		var ed_server = new Ed( );
		
		setTimeout( function( ){
			ed_server.stop( );
			setTimeout( function( ){
				test_shenzi.close( );
				test_banzai.close( );
				unit.done( );
			}, 5000 );
		}, 5000 );
	}
};