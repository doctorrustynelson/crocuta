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
		var ed_server = null;
		
		var timeout = setTimeout( function( ){
			unit.ok( 'false' );
			ed_server.stop( );			
			test_shenzi.close( );
			test_banzai.close( );
			unit.done( );
		}, 5000 );
		
		var expected_number_of_completions = 2;
		function stageCompleted( ){
			if( --expected_number_of_completions <= 0 ){
				clearTimeout( timeout );
				ed_server.stop( );			
				test_shenzi.close( );
				test_banzai.close( );
				unit.done();
			}
			
		}
		
		test_shenzi.on( 'connection', function( /* socket */ ){
			unit.ok( true, 'Connected to Shenzi.' );
			stageCompleted( );
		} );
		
		test_banzai.on( 'connection', function( /* socket */ ){
			unit.ok( true, 'Connected to Banzai.' );
			stageCompleted( );
		} );
		
		test_shenzi.listen( 2102 ); 
		test_banzai.listen( 2103 ); 

		ed_server = new Ed();
		
	},
	
	registationAutomaticlyAfterConnection: function( unit ){
		unit.expect(4);
		
		var test_shenzi = new Server( );
		var test_banzai = new Server( );
		var ed_server = null;
		
		var timeout = setTimeout( function( ){
			unit.ok( 'false' );
			ed_server.stop( );			
			test_shenzi.close( );
			test_banzai.close( );
			unit.done( );
		}, 5000 );
		
		var expected_number_of_completions = 4;
		function stageCompleted( ){
			if( --expected_number_of_completions <= 0 ){
				clearTimeout( timeout );
				ed_server.stop( );			
				test_shenzi.close( );
				test_banzai.close( );
				unit.done();
			}	
		}
		
		test_shenzi.on( 'connection', function( socket ){
			unit.ok( true, 'Connected to Shenzi.' );
			stageCompleted( );
			
			socket.on( 'register', function( /* data */ ){
				unit.ok( true, 'Registered with Shenzi.' );
				stageCompleted( );
			} );
		} );
		
		test_banzai.on( 'connection', function( socket ){
			unit.ok( true, 'Connected to Banzai.' );
			stageCompleted( );
			
			socket.on( 'register', function( /* data */ ){
				unit.ok( true, 'Registered with Banzai.' );
				stageCompleted( );
			} );
		} );
		
		test_shenzi.listen( 2102 ); 
		test_banzai.listen( 2103 ); 
		
		ed_server = new Ed( );
	}
};

module.exports.stopTests = {
	stopThenNoReattemptsToConnect: function( unit ){
		unit.expect(2);
		
		var test_shenzi = new Server( );
		var test_banzai = new Server( );
		var ed_server = null;
		
		test_shenzi.on( 'connection', function( /* socket */ ){
			unit.ok( true, 'Connected to Shenzi.' );
		} );
		
		test_banzai.on( 'connection', function( /* socket */ ){
			unit.ok( true, 'Connected to Banzai.' );
		} );
		
		test_shenzi.listen( 2102 ); 
		test_banzai.listen( 2103 ); 
		
		ed_server = new Ed( );
		
		setTimeout( function( ){
			ed_server.stop( );
			setTimeout( function( ){
				test_shenzi.close( );
				test_banzai.close( );
				unit.done( );
			}, 3000 );
		}, 1000 );
	}
};

module.exports.processJouleTests = {
		simpleAnonymousJoule: function( unit ){
			unit.expect(3);
			
			var test_shenzi = new Server( );
			//var test_banzai = new Server( );
			var ed_server = null;
			
			var timeout = setTimeout( function( ){
				unit.ok( false, 'Test timed out.' );
				ed_server.stop( );			
				test_shenzi.close( );
				//test_banzai.close( );
				unit.done( );
			}, 5000 );
			
			test_shenzi.on( 'connection', function( socket ){
				unit.ok( true, 'Connected to Shenzi.' );
				
				socket.on( 'register', function( /* data */ ){
					unit.ok( true, 'Registered with Shenzi.' );
					
					socket.emit( 'joule', {
						deploy: 'anonymous',
						func: 'function( input, output, utils ){ output.return( 12345 ); }'
					} );
				} );
				
				socket.on( 'joule-result', function( result ){
					unit.equal( result, 12345, 'Joule returned correct result.' );
					clearTimeout( timeout );
					ed_server.stop( );
					test_shenzi.close( );
					unit.done();
				} );
			} );
			
			//test_banzai.on( 'connection', function( /* socket */ ){
			//	unit.ok( true, 'Connected to Banzai.' );
			//} );
			
			test_shenzi.listen( 2102 ); 
			//test_banzai.listen( 2103 ); 
			
			ed_server = new Ed( );
		}
	};