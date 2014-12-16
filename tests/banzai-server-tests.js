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

//var fs = require( 'fs' );
var path = require( 'path' );
var Banzai = require( '../lib/banzai-server.js' );
var Server = require( 'socket.io' );
//var Client = require( 'socket.io-client' );
var config = require( '../lib/utils/config' );
config.reinitialize( path.resolve( __dirname, './config/test.config.json' ) );

module.exports.setUp = function( callback ){
	
	callback( );
};

module.exports.tearDown = function( callback ){

	callback( );
};

module.exports.initialConnectionTests = {
	
	plainConnection: function( unit ){
		unit.expect(1);
		
		var test_shenzi = new Server( );
		var banzai_server = null;
		//var test_ed = new Client( 'http://' + config.get( 'shenzi.host' ) + ':' + config.get( 'shenzi.port' ), config.get( 'ed.connection.options' ) );
		
		var timeout = setTimeout( function( ){
			unit.ok( 'false' );
			banzai_server.stop( );			
			test_shenzi.close( );
			//test_ed.disconnect( true );
			unit.done( );
		}, 5000 );
		
		var expected_number_of_completions = 1;
		function stageCompleted( ){
			if( --expected_number_of_completions <= 0 ){
				clearTimeout( timeout );
				banzai_server.stop( );			
				test_shenzi.close( );
				//test_ed.disconnect( true );
				unit.done( );
			}
			
		}
		
		test_shenzi.on( 'connection', function( /* socket */ ){
			unit.ok( true, 'Connected to Shenzi.' );
			stageCompleted( );
		} );
		
		test_shenzi.listen( 2102 ); 

		banzai_server = new Banzai();
		
	},
	
	registationAutomaticlyAfterConnection: function( unit ){
		unit.expect(2);
		
		var test_shenzi = new Server( );
		var banzai_server = null;
		//var test_ed = new Client( 'http://' + config.get( 'shenzi.host' ) + ':' + config.get( 'shenzi.port' ), config.get( 'ed.connection.options' ) );
		
		var timeout = setTimeout( function( ){
			unit.ok( 'false' );
			banzai_server.stop( );			
			test_shenzi.close( );
			//test_ed.disconnect( true );
			unit.done( );
		}, 5000 );
		
		var expected_number_of_completions = 2;
		function stageCompleted( ){
			if( --expected_number_of_completions <= 0 ){
				clearTimeout( timeout );
				banzai_server.stop( );			
				test_shenzi.close( );
				//test_ed.disconnect( true );
				unit.done( );
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
		
		test_shenzi.listen( 2102 ); 

		banzai_server = new Banzai();
	}
};

module.exports.stopTests = {
	stopThenNoReattemptsToConnect: function( unit ){
		unit.expect(1);
		
		var test_shenzi = new Server( );
		var banzai_server = null;
		//var test_ed = new Client( 'http://' + config.get( 'shenzi.host' ) + ':' + config.get( 'shenzi.port' ), config.get( 'ed.connection.options' ) );
		
		test_shenzi.on( 'connection', function( /* socket */ ){
			unit.ok( true, 'Connected to Shenzi.' );
		} );
		
		
		test_shenzi.listen( 2102 ); 
		
		banzai_server = new Banzai( );
		
		setTimeout( function( ){
			banzai_server.stop( );
			setTimeout( function( ){		
				test_shenzi.close( );
				//test_ed.disconnect( true );
				unit.done( );
			}, 3000 );
		}, 1000 );
	}
};