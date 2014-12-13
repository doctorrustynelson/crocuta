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

var fs = require( 'fs' );
var path = require( 'path' );
var DataManager = require( '../lib/data-manager.js' );
var config = require( '../lib/utils/config' );
config.reinitialize( path.resolve( __dirname, './config/test.config.json' ) );
var data_root = config.get( 'ed.data.location' );

module.exports.setUp = function( callback ){
	
	if( !fs.existsSync( data_root ) ){
		fs.mkdirSync( data_root );
	}
	
	fs.readdirSync( data_root ).forEach( function( file ){
		fs.unlinkSync( path.join( data_root, file ) );
	} );
	callback( );
};

module.exports.tearDown = function( callback ){
	fs.readdirSync( data_root ).forEach( function( file ){
		fs.unlinkSync( path.join( data_root, file ) );
	} );
	callback( );
};

module.exports.listKeysTests = {
	
	emptyOnNewStartup: function( unit ){
		var mngr = new DataManager( );
		
		unit.deepEqual( mngr.listKeys(), [], 'Empty DataManager on startup.' );
		
		unit.done();
	},
	
	picksUpPreexistingKeysOnStartup: function( unit ){
		fs.writeFileSync( path.join( data_root, 'hello' ), 'Hello Corcuta!' );
		fs.writeFileSync( path.join( data_root, 'json' ), '{ "something": false, "else": 1 }' );
		fs.writeFileSync( path.join( data_root, 'nested.file' ), 'Cool' );
		var mngr = new DataManager( );
		
		unit.deepEqual( mngr.listKeys().sort(), [ 'hello', 'json', 'nested.file' ], 'Initialized DataManager on startup.' );
		
		unit.done();
	}
};

module.exports.storeTests = {
	
	simpleStore: function( unit ){
		var mngr = new DataManager( );
		unit.deepEqual( mngr.listKeys(), [], 'Empty DataManager on startup.' );
		
		mngr.store( 'store.test.file', 'Basic Data', function( err ){
			unit.equal( err, null, 'No error on store.' );
			unit.equal( 'Basic Data', fs.readFileSync( path.join( data_root, 'store.test.file' ) ), 'Stored file contents are correct.' );
			unit.deepEqual(  mngr.listKeys(), [ 'store.test.file' ], 'ListKeys has new key.' );
			unit.done();
		} );
	}
};

module.exports.storeSyncTests = {
		
	simpleStore: function( unit ){
		var mngr = new DataManager( );
		unit.deepEqual( mngr.listKeys(), [], 'Empty DataManager on startup.' );
		
		mngr.storeSync( 'store.test.file', 'Basic Data' );
		
		unit.equal( 'Basic Data', fs.readFileSync( path.join( data_root, 'store.test.file' ) ), 'Stored file contents are correct.' );
		unit.deepEqual(  mngr.listKeys(), [ 'store.test.file' ], 'ListKeys has new key.' );
		unit.done();
	}
};

module.exports.loseTests = {
		
	simpleLose: function( unit ){
		fs.writeFileSync( path.join( data_root, 'hello' ), 'Hello Corcuta!' );
		fs.writeFileSync( path.join( data_root, 'json' ), '{ "something": false, "else": 1 }' );
		fs.writeFileSync( path.join( data_root, 'nested.file' ), 'Cool' );
		var mngr = new DataManager( );
		
		unit.deepEqual( mngr.listKeys().sort(), [ 'hello', 'json', 'nested.file' ], 'Initialized DataManager on startup.' );
		
		mngr.lose( 'json', function( err ){
			unit.equal( err, null, 'No error on lose.' );
			unit.equal( false, fs.existsSync( path.join( data_root, 'json' ) ), 'Lost file does not exist.' );
			unit.ok( mngr.listKeys().indexOf( 'json' ) === -1, 'ListKeys has lost key.' );
			unit.done();
		} );
	},

	multiLose: function( unit ){
		fs.writeFileSync( path.join( data_root, 'hello' ), 'Hello Corcuta!' );
		fs.writeFileSync( path.join( data_root, 'json' ), '{ "something": false, "else": 1 }' );
		fs.writeFileSync( path.join( data_root, 'nested.file' ), 'Cool' );
		var mngr = new DataManager( );
		
		unit.deepEqual( mngr.listKeys().sort(), [ 'hello', 'json', 'nested.file' ], 'Initialized DataManager on startup.' );
		
		var num_stages = 3;
		function stageComplete( ){
			if( --num_stages <= 0 ){
				unit.done();
			}
		}
		
		mngr.lose( 'json', function( err ){
			unit.equal( err, null, 'No error on lose.' );
			unit.equal( false, fs.existsSync( path.join( data_root, 'json' ) ), 'Lost file does not exist.' );
			unit.ok( mngr.listKeys().indexOf( 'json' ) === -1 , 'ListKeys has lost key.' );
			stageComplete( );
		} );
		
		mngr.lose( 'hello', function( err ){
			unit.equal( err, null, 'No error on lose.' );
			unit.equal( false, fs.existsSync( path.join( data_root, 'hello' ) ), 'Lost file does not exist.' );
			unit.ok( mngr.listKeys().indexOf( 'hello' ) === -1, 'ListKeys has lost key.' );
			stageComplete( );
		} );
		
		mngr.lose( 'nested.file', function( err ){
			unit.equal( err, null, 'No error on lose.' );
			unit.equal( false, fs.existsSync( path.join( data_root, 'nested.file' ) ), 'Lost file does not exist.' );
			unit.ok( mngr.listKeys().indexOf( 'nested.file' ) === -1, 'ListKeys has lost key.' );
			stageComplete( );
		} );
	}
};

module.exports.loseSyncTests = {
		
	simpleLose: function( unit ){
		fs.writeFileSync( path.join( data_root, 'hello' ), 'Hello Corcuta!' );
		fs.writeFileSync( path.join( data_root, 'json' ), '{ "something": false, "else": 1 }' );
		fs.writeFileSync( path.join( data_root, 'nested.file' ), 'Cool' );
		var mngr = new DataManager( );
		
		unit.deepEqual( mngr.listKeys().sort(), [ 'hello', 'json', 'nested.file' ], 'Initialized DataManager on startup.' );
		
		mngr.loseSync( 'json' );
		
		unit.equal( false, fs.existsSync( path.join( data_root, 'json' ) ), 'Lost file does not exist.' );
		unit.ok( mngr.listKeys().indexOf( 'json' ) === -1, 'ListKeys has lost key.' );
		unit.done();
	},

	multiLose: function( unit ){
		fs.writeFileSync( path.join( data_root, 'hello' ), 'Hello Corcuta!' );
		fs.writeFileSync( path.join( data_root, 'json' ), '{ "something": false, "else": 1 }' );
		fs.writeFileSync( path.join( data_root, 'nested.file' ), 'Cool' );
		var mngr = new DataManager( );
		
		unit.deepEqual( mngr.listKeys().sort(), [ 'hello', 'json', 'nested.file' ], 'Initialized DataManager on startup.' );
		
		mngr.loseSync( 'json' );
		mngr.loseSync( 'hello' );
		mngr.loseSync( 'nested.file' );
		
		unit.equal( false, fs.existsSync( path.join( data_root, 'json' ) ), 'Lost file does not exist.' );
		unit.equal( false, fs.existsSync( path.join( data_root, 'hello' ) ), 'Lost file does not exist.' );
		unit.equal( false, fs.existsSync( path.join( data_root, 'nested.file' ) ), 'Lost file does not exist.' );
		unit.deepEqual(  mngr.listKeys(), [ ], 'ListKeys has lost keys.' );		
		unit.done();
	}
};

module.exports.getTests = {
		
	simpleGet: function( unit ){
		fs.writeFileSync( path.join( data_root, 'hello' ), 'Hello Corcuta!' );
		fs.writeFileSync( path.join( data_root, 'json' ), '{ "something": false, "else": 1 }' );
		fs.writeFileSync( path.join( data_root, 'nested.file' ), 'Cool' );
		var mngr = new DataManager( );
		
		unit.deepEqual( mngr.listKeys().sort(), [ 'hello', 'json', 'nested.file' ], 'Initialized DataManager on startup.' );
		
		mngr.get( 'json', function( err, data ){
			unit.equal( err, null, 'No error on get.' );
			unit.equal( data, '{ "something": false, "else": 1 }', 'Retrived data matches' );
			unit.done();
		} );			
	}
};

module.exports.getSyncTests = {
		
	simpleGet: function( unit ){
		fs.writeFileSync( path.join( data_root, 'hello' ), 'Hello Corcuta!' );
		fs.writeFileSync( path.join( data_root, 'json' ), '{ "something": false, "else": 1 }' );
		fs.writeFileSync( path.join( data_root, 'nested.file' ), 'Cool' );
		var mngr = new DataManager( );
		
		unit.deepEqual( mngr.listKeys().sort(), [ 'hello', 'json', 'nested.file' ], 'Initialized DataManager on startup.' );

		unit.equal( mngr.getSync( 'json' ), '{ "something": false, "else": 1 }', 'Retrived data matches' );
		unit.done();			
	}
};




