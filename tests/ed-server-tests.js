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
var Ed = require( '../lib/ed-server.js' );
var Server = require( 'socket.io' );
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
		unit.expect(5);
		
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
			
			socket.on( 'register', function( data ){
				unit.ok( true, 'Registered with Banzai.' );
				unit.deepEqual( data.datakeys, [], 'Expecting empty datakeys.' );
				stageCompleted( );
			} );
		} );
		
		test_shenzi.listen( 2102 ); 
		test_banzai.listen( 2103 ); 
		
		ed_server = new Ed( );
	},
	
	sendIntializedDataKeysToBanzaiAfterConnection: function( unit ){
		unit.expect(5);
		
		fs.writeFileSync( path.join( data_root, 'hello' ), 'Hello Corcuta!' );
		fs.writeFileSync( path.join( data_root, 'json' ), '{ "something": false, "else": 1 }' );
		fs.writeFileSync( path.join( data_root, 'nested.file' ), 'Cool' );
		
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
			
			socket.on( 'register', function( data ){
				unit.ok( true, 'Registered with Banzai.' );
				unit.deepEqual( data.datakeys.sort(), [ 'hello', 'json', 'nested.file' ], 'Expecting initalized datakeys.' );
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
		unit.expect(4);
		
		var test_shenzi = new Server( );
		var ed_server = null;
		
		var timeout = setTimeout( function( ){
			unit.ok( false, 'Test timed out.' );
			ed_server.stop( );			
			test_shenzi.close( );
			unit.done( );
		}, 5000 );
		
		test_shenzi.on( 'connection', function( socket ){
			unit.ok( true, 'Connected to Shenzi.' );
			
			socket.on( 'register', function( /* data */ ){
				unit.ok( true, 'Registered with Shenzi.' );
				
				socket.emit( 'joule', { 
					input: undefined,
					joule: {
						deploy: 'anonymous',
						func: 'function( ){ done( 12345 ); }'
					}
				} );
			} );
			
			socket.on( 'joule:complete', function( result ){
				unit.ok( result.success, 'Joule returned successfully.' );
				unit.equal( result.output, 12345, 'Joule returned correct result.' );
				clearTimeout( timeout );
				ed_server.stop( );
				test_shenzi.close( );
				unit.done();
			} );
		} );
		
		test_shenzi.listen( 2102 ); 
		
		ed_server = new Ed( );
	},
	
	badDeployType: function( unit ){
		unit.expect(4);
		
		var test_shenzi = new Server( );
		var ed_server = null;
		
		var timeout = setTimeout( function( ){
			unit.ok( false, 'Test timed out.' );
			ed_server.stop( );			
			test_shenzi.close( );
			unit.done( );
		}, 5000 );
		
		var stages = 2;
		function stageComplete(){
			if( --stages <= 0 ){
				clearTimeout( timeout );
				ed_server.stop( );
				test_shenzi.close( );
				unit.done();
			}
		}
		
		test_shenzi.on( 'connection', function( socket ){
			unit.ok( true, 'Connected to Shenzi.' );
			
			socket.on( 'register', function( /* data */ ){
				unit.ok( true, 'Registered with Shenzi.' );
				
				socket.emit( 'joule', {
					input: undefined,
					joule: {
						deploy: 'bad-deploy-type',
						func: 'function( ){ done( 12345 ); }'
					}
				} );
			} );
			
			socket.on( 'joule:complete', function( result ){
				unit.ok( !result.success, 'Joule returned unsuccessfully.' );
				stageComplete();
			} );
			
			socket.on( 'err', function( error ){
				unit.equal( error.type, 'joule', 'Joule error was thrown.' );
				stageComplete();
			} );
		} );
		
		test_shenzi.listen( 2102 );  
		
		ed_server = new Ed( );
	},
	
	simpleAnonymousJouleWithInputs: function( unit ){
		unit.expect(4);
		
		var test_shenzi = new Server( );
		var ed_server = null;
		
		var timeout = setTimeout( function( ){
			unit.ok( false, 'Test timed out.' );
			ed_server.stop( );			
			test_shenzi.close( );
			unit.done( );
		}, 5000 );
		
		test_shenzi.on( 'connection', function( socket ){
			unit.ok( true, 'Connected to Shenzi.' );
			
			socket.on( 'register', function( /* data */ ){
				unit.ok( true, 'Registered with Shenzi.' );
				
				socket.emit( 'joule', {
					joule: {
						deploy: 'anonymous',
						func: [ 'function( ){',
						        	'var result = {};',
						        	'input.value.split( " " ).forEach( function( word ){',
						        		'result[ word ] = ( result[ word ] === undefined ? 1 : result[ word ] + 1 );',
						        	'} );',
						        	'done( result );',
						        '}'
						      ].join( '\n' ),
					},
					input: {
						value: 'Hello Crocuta . This is a Test .'
					}
				} );
			} );
			
			socket.on( 'err', function( /* error */ ){
				unit.ok( false, 'Joule error was thrown.' );
				clearTimeout( timeout );
				ed_server.stop( );
				test_shenzi.close( );
				unit.done();
			} );
			
			socket.on( 'joule:complete', function( result ){
				unit.ok( result.success, 'Joule returned successfully.' );
				unit.deepEqual( result.output, {
					Hello: 1,
					Crocuta: 1,
					'.': 2,
					This: 1,
					is: 1,
					a: 1,
					Test: 1
				}, 'Joule Returned Correct Results.' );
				clearTimeout( timeout );
				ed_server.stop( );
				test_shenzi.close( );
				unit.done();
			} );
		} );
		
		test_shenzi.listen( 2102 ); 
		
		ed_server = new Ed( );
	}
};

module.exports.listDataTests = {
	
	listDataWhenUnInitialized: function( unit ){
		unit.expect(5);
		
		//var test_shenzi = new Server( );
		var test_banzai = new Server( );
		var ed_server = null;
		
		var timeout = setTimeout( function( ){
			unit.ok( 'false' );
			ed_server.stop( );			
			//test_shenzi.close( );
			test_banzai.close( );
			unit.done( );
		}, 5000 );
		
		var expected_number_of_completions = 3;
		function stageCompleted( ){
			if( --expected_number_of_completions <= 0 ){
				clearTimeout( timeout );
				ed_server.stop( );			
				//test_shenzi.close( );
				test_banzai.close( );
				unit.done();
			}	
		}
		
//			test_shenzi.on( 'connection', function( socket ){
//				unit.ok( true, 'Connected to Shenzi.' );
//				stageCompleted( );
//				
//				socket.on( 'register', function( /* data */ ){
//					unit.ok( true, 'Registered with Shenzi.' );
//					stageCompleted( );
//				} );
//			} );
		
		var banzai_connected = false;
		test_banzai.on( 'connection', function( socket ){
			if( !banzai_connected ){
				unit.ok( true, 'Connected to Banzai.' );
				banzai_connected = true;
				stageCompleted( );
			}
			
			socket.on( 'register', function( data ){
				unit.ok( true, 'Registered with Banzai.' );
				unit.deepEqual( data.datakeys, [ ], 'Expecting empty datakeys.' );
				
				socket.emit( 'list-data', {} );
				
				stageCompleted( );
			} );
			
			socket.on( 'list-confirmation', function( data ){
				unit.ok( data.success, 'Successfully returned from listing data.' );
				unit.deepEqual( data.keys, [], 'Empty data.keys returned.' );				
				stageCompleted( );
			} );
		} );
		
		//test_shenzi.listen( 2102 ); 
		test_banzai.listen( 2103 ); 
		
		ed_server = new Ed( );
	},
	
	listDataWhenInitialized: function( unit ){
		unit.expect(5);
		
		fs.writeFileSync( path.join( data_root, 'hello' ), 'Hello Corcuta!' );
		fs.writeFileSync( path.join( data_root, 'json' ), '{ "something": false, "else": 1 }' );
		fs.writeFileSync( path.join( data_root, 'nested.file' ), 'Cool' );
		
		//var test_shenzi = new Server( );
		var test_banzai = new Server( );
		var ed_server = null;
		
		var timeout = setTimeout( function( ){
			unit.ok( 'false' );
			ed_server.stop( );			
			//test_shenzi.close( );
			test_banzai.close( );
			unit.done( );
		}, 5000 );
		
		var expected_number_of_completions = 3;
		function stageCompleted( ){
			if( --expected_number_of_completions <= 0 ){
				clearTimeout( timeout );
				ed_server.stop( );			
				//test_shenzi.close( );
				test_banzai.close( );
				unit.done();
			}	
		}
		
//		test_shenzi.on( 'connection', function( socket ){
//			unit.ok( true, 'Connected to Shenzi.' );
//			stageCompleted( );
//			
//			socket.on( 'register', function( /* data */ ){
//				unit.ok( true, 'Registered with Shenzi.' );
//				stageCompleted( );
//			} );
//		} );
		
		var banzai_connected = false;
		test_banzai.on( 'connection', function( socket ){
			if( !banzai_connected ){
				unit.ok( true, 'Connected to Banzai.' );
				banzai_connected = true;
				stageCompleted( );
			}
			
			socket.on( 'register', function( data ){
				unit.ok( true, 'Registered with Banzai.' );
				unit.deepEqual( data.datakeys.sort(), [ 'hello', 'json', 'nested.file' ], 'Expecting initalized datakeys.' );
				
				socket.emit( 'list-data', {} );
				
				stageCompleted( );
			} );
			
			socket.on( 'list-confirmation', function( data ){
				unit.ok( data.success, 'Successfully returned from listing data.' );
				unit.deepEqual( data.keys.sort(), [ 'hello', 'json', 'nested.file' ], 'Correct data.keys returned.' );				
				stageCompleted( );
			} );
		} );
		
		//test_shenzi.listen( 2102 ); 
		test_banzai.listen( 2103 ); 
		
		ed_server = new Ed( );
	}
};

module.exports.getDataTests = {
	getSingleData: function( unit ){
		unit.expect(6);
		
		fs.writeFileSync( path.join( data_root, 'hello' ), 'Hello Corcuta!' );
		fs.writeFileSync( path.join( data_root, 'json' ), '{ "something": false, "else": 1 }' );
		fs.writeFileSync( path.join( data_root, 'nested.file' ), 'Cool' );
		
		var test_banzai = new Server( );
		var ed_server = null;
		
		var timeout = setTimeout( function( ){
			unit.ok( 'false' );
			ed_server.stop( );			
			test_banzai.close( );
			unit.done( );
		}, 10000 );
		
		var expected_number_of_completions = 3;
		function stageCompleted( ){
			if( --expected_number_of_completions <= 0 ){
				clearTimeout( timeout );
				ed_server.stop( );			
				test_banzai.close( );
				unit.done();
			}	
		}
		
		var banzai_connected = false;
		test_banzai.on( 'connection', function( socket ){
			if( !banzai_connected ){
				unit.ok( true, 'Connected to Banzai.' );
				banzai_connected = true;
				stageCompleted( );
			}
			
			socket.on( 'register', function( data ){
				unit.ok( true, 'Registered with Banzai.' );
				unit.deepEqual( data.datakeys.sort(), [ 'hello', 'json', 'nested.file' ], 'Expecting initalized datakeys.' );
				
				socket.emit( 'get-data', { key: 'nested.file' } );
				
				stageCompleted( );
			} );
			
			socket.on( 'get-confirmation', function( result ){
				unit.ok( result.success, 'Successfully returned from getting data.' );
				unit.equal( result.key, 'nested.file', 'Correct key returned' );
				unit.deepEqual( result.data,  'Cool' , 'Correct result returned.' );				
				stageCompleted( );
			} );
		} );
		
		test_banzai.listen( 2103 ); 
		
		ed_server = new Ed( );
	},
	
	getMultipleData: function( unit ){
		unit.expect(9);
		
		fs.writeFileSync( path.join( data_root, 'hello' ), 'Hello Corcuta!' );
		fs.writeFileSync( path.join( data_root, 'json' ), '{ "something": false, "else": 1 }' );
		fs.writeFileSync( path.join( data_root, 'nested.file' ), 'Cool' );
		
		var test_banzai = new Server( );
		var ed_server = null;
		
		var timeout = setTimeout( function( ){
			unit.ok( 'false' );
			ed_server.stop( );			
			test_banzai.close( );
			unit.done( );
		}, 10000 );
		
		var expected_number_of_completions = 5;
		function stageCompleted( ){
			if( --expected_number_of_completions <= 0 ){
				clearTimeout( timeout );
				ed_server.stop( );			
				test_banzai.close( );
				unit.done();
			}	
		}
		
		var banzai_connected = false;
		test_banzai.on( 'connection', function( socket ){
			if( !banzai_connected ){
				unit.ok( true, 'Connected to Banzai.' );
				banzai_connected = true;
				stageCompleted( );
			}
			
			socket.on( 'register', function( data ){
				unit.ok( true, 'Registered with Banzai.' );
				unit.deepEqual( data.datakeys.sort(), [ 'hello', 'json', 'nested.file' ], 'Expecting initalized datakeys.' );
				
				socket.emit( 'get-data', { key: 'nested.file' } );
				socket.emit( 'get-data', { key: 'hello' } );
				socket.emit( 'get-data', { key: 'json' } );
				
				stageCompleted( );
			} );
			
			socket.on( 'get-confirmation', function( result ){
				unit.ok( result.success, 'Successfully returned from getting data.' );
				
				if( result.key === 'nested.file' ){
					unit.deepEqual( result.data,  'Cool' , 'Correct result returned.' );				
					stageCompleted( );
				}
				
				if( result.key === 'hello' ){
					unit.deepEqual( result.data,  'Hello Corcuta!' , 'Correct result returned.' );				
					stageCompleted( );
				}
				
				if( result.key === 'json' ){
					unit.deepEqual( result.data,  '{ "something": false, "else": 1 }' , 'Correct result returned.' );				
					stageCompleted( );
				}
				
				
			} );
		} );
		
		test_banzai.listen( 2103 ); 
		
		ed_server = new Ed( );
	},
	
	getBadData: function( unit ){
		unit.expect(5);
		
		fs.writeFileSync( path.join( data_root, 'hello' ), 'Hello Corcuta!' );
		fs.writeFileSync( path.join( data_root, 'json' ), '{ "something": false, "else": 1 }' );
		fs.writeFileSync( path.join( data_root, 'nested.file' ), 'Cool' );
		
		var test_banzai = new Server( );
		var ed_server = null;
		
		var timeout = setTimeout( function( ){
			unit.ok( 'false' );
			ed_server.stop( );			
			test_banzai.close( );
			unit.done( );
		}, 10000 );
		
		var expected_number_of_completions = 3;
		function stageCompleted( ){
			if( --expected_number_of_completions <= 0 ){
				clearTimeout( timeout );
				ed_server.stop( );			
				test_banzai.close( );
				unit.done();
			}	
		}
		
		var banzai_connected = false;
		test_banzai.on( 'connection', function( socket ){
			if( !banzai_connected ){
				unit.ok( true, 'Connected to Banzai.' );
				banzai_connected = true;
				stageCompleted( );
			}
			
			socket.on( 'register', function( data ){
				unit.ok( true, 'Registered with Banzai.' );
				unit.deepEqual( data.datakeys.sort(), [ 'hello', 'json', 'nested.file' ], 'Expecting initalized datakeys.' );
				
				socket.emit( 'get-data', { key: 'bad.file' } );
				
				stageCompleted( );
			} );
			
			socket.on( 'get-confirmation', function( result ){
				unit.ok( !result.success, 'Unsuccessfully returned from getting data.' );
				unit.equal( result.key, 'bad.file', 'Correct key returned' );			
				stageCompleted( );
			} );
		} );
		
		test_banzai.listen( 2103 ); 
		
		ed_server = new Ed( );
	},
};

module.exports.loseDataTests = {
	loseSingleData: function( unit ){
		unit.expect(7);
		
		fs.writeFileSync( path.join( data_root, 'hello' ), 'Hello Corcuta!' );
		fs.writeFileSync( path.join( data_root, 'json' ), '{ "something": false, "else": 1 }' );
		fs.writeFileSync( path.join( data_root, 'nested.file' ), 'Cool' );
		
		var test_banzai = new Server( );
		var ed_server = null;
		
		var timeout = setTimeout( function( ){
			unit.ok( 'false' );
			ed_server.stop( );			
			test_banzai.close( );
			unit.done( );
		}, 10000 );
		
		var expected_number_of_completions = 4;
		function stageCompleted( ){
			if( --expected_number_of_completions <= 0 ){
				clearTimeout( timeout );
				ed_server.stop( );			
				test_banzai.close( );
				unit.done();
			}	
		}
		
		var banzai_connected = false;
		test_banzai.on( 'connection', function( socket ){
			if( !banzai_connected ){
				unit.ok( true, 'Connected to Banzai.' );
				banzai_connected = true;
				stageCompleted( );
			}
			
			socket.on( 'register', function( data ){
				unit.ok( true, 'Registered with Banzai.' );
				unit.deepEqual( data.datakeys.sort(), [ 'hello', 'json', 'nested.file' ], 'Expecting initalized datakeys.' );
				
				socket.emit( 'lose-data', { key: 'nested.file' } );
				
				stageCompleted( );
			} );
			
			socket.on( 'list-confirmation', function( result ){
				unit.ok( result.success, 'Successfully returned from listing data.' );
				unit.deepEqual( result.keys.sort(), [ 'hello', 'json' ], 'Correct data.keys returned.' );
				stageCompleted( );
			} );
			
			socket.on( 'lose-confirmation', function( result ){
				unit.ok( result.success, 'Successfully returned from losing data.' );
				unit.equal( result.key, 'nested.file', 'Correct key returned' );

				socket.emit( 'list-data', {} );
				
				stageCompleted( );
			} );
		} );
		
		test_banzai.listen( 2103 ); 
		
		ed_server = new Ed( );
	},
	
	loseBadData: function( unit ){
		unit.expect(7);
		
		fs.writeFileSync( path.join( data_root, 'hello' ), 'Hello Corcuta!' );
		fs.writeFileSync( path.join( data_root, 'json' ), '{ "something": false, "else": 1 }' );
		fs.writeFileSync( path.join( data_root, 'nested.file' ), 'Cool' );
		
		var test_banzai = new Server( );
		var ed_server = null;
		
		var timeout = setTimeout( function( ){
			unit.ok( 'false' );
			ed_server.stop( );			
			test_banzai.close( );
			unit.done( );
		}, 10000 );
		
		var expected_number_of_completions = 4;
		function stageCompleted( ){
			if( --expected_number_of_completions <= 0 ){
				clearTimeout( timeout );
				ed_server.stop( );			
				test_banzai.close( );
				unit.done();
			}	
		}
		
		var banzai_connected = false;
		test_banzai.on( 'connection', function( socket ){
			if( !banzai_connected ){
				unit.ok( true, 'Connected to Banzai.' );
				banzai_connected = true;
				stageCompleted( );
			}
			
			socket.on( 'register', function( data ){
				unit.ok( true, 'Registered with Banzai.' );
				unit.deepEqual( data.datakeys.sort(), [ 'hello', 'json', 'nested.file' ], 'Expecting initalized datakeys.' );
				
				socket.emit( 'lose-data', { key: 'bad.file' } );
				
				stageCompleted( );
			} );
			
			socket.on( 'list-confirmation', function( result ){
				unit.ok( result.success, 'Successfully returned from listing data.' );
				unit.deepEqual( result.keys.sort(), [ 'hello', 'json', 'nested.file' ], 'Correct data.keys returned.' );
				stageCompleted( );
			} );
			
			socket.on( 'lose-confirmation', function( result ){
				unit.ok( !result.success, 'Unsuccessfully returned from losing data.' );
				unit.equal( result.key, 'bad.file', 'Correct key returned' );

				socket.emit( 'list-data', {} );
				
				stageCompleted( );
			} );
		} );
		
		test_banzai.listen( 2103 ); 
		
		ed_server = new Ed( );
	}
};

module.exports.holdDataTests = {
	holdSingleTextData: function( unit ){
		unit.expect(7);
		
		fs.writeFileSync( path.join( data_root, 'hello' ), 'Hello Corcuta!' );
		fs.writeFileSync( path.join( data_root, 'json' ), '{ "something": false, "else": 1 }' );
		fs.writeFileSync( path.join( data_root, 'nested.file' ), 'Cool' );
		
		var test_banzai = new Server( );
		var ed_server = null;
		
		var timeout = setTimeout( function( ){
			unit.ok( 'false' );
			ed_server.stop( );			
			test_banzai.close( );
			unit.done( );
		}, 10000 );
		
		var expected_number_of_completions = 4;
		function stageCompleted( ){
			if( --expected_number_of_completions <= 0 ){
				clearTimeout( timeout );
				ed_server.stop( );			
				test_banzai.close( );
				unit.done();
			}	
		}
		
		var banzai_connected = false;
		test_banzai.on( 'connection', function( socket ){
			if( !banzai_connected ){
				unit.ok( true, 'Connected to Banzai.' );
				banzai_connected = true;
				stageCompleted( );
			}
			
			socket.on( 'register', function( data ){
				unit.ok( true, 'Registered with Banzai.' );
				unit.deepEqual( data.datakeys.sort(), [ 'hello', 'json', 'nested.file' ], 'Expecting initalized datakeys.' );
				
				socket.emit( 'hold-data', { key: 'other.file', type: 'text', value: 'Nice Day.' } );
				
				stageCompleted( );
			} );
			
			socket.on( 'list-confirmation', function( result ){
				unit.ok( result.success, 'Successfully returned from listing data.' );
				unit.deepEqual( result.keys.sort(), [ 'hello', 'json', 'nested.file', 'other.file' ], 'Correct data.keys returned.' );
				stageCompleted( );
			} );
			
			socket.on( 'hold-confirmation', function( result ){
				unit.ok( result.success, 'Successfully returned from losing data.' );
				unit.equal( result.key, 'other.file', 'Correct key returned' );

				socket.emit( 'list-data', {} );
				
				stageCompleted( );
			} );
		} );
		
		test_banzai.listen( 2103 ); 
		
		ed_server = new Ed( );
	},
	
	holdSingleBadTypeData: function( unit ){
		unit.expect(8);
		
		fs.writeFileSync( path.join( data_root, 'hello' ), 'Hello Corcuta!' );
		fs.writeFileSync( path.join( data_root, 'json' ), '{ "something": false, "else": 1 }' );
		fs.writeFileSync( path.join( data_root, 'nested.file' ), 'Cool' );
		
		var test_banzai = new Server( );
		var ed_server = null;
		
		var timeout = setTimeout( function( ){
			unit.ok( 'false' );
			ed_server.stop( );			
			test_banzai.close( );
			unit.done( );
		}, 10000 );
		
		var expected_number_of_completions = 5;
		function stageCompleted( ){
			if( --expected_number_of_completions <= 0 ){
				clearTimeout( timeout );
				ed_server.stop( );			
				test_banzai.close( );
				unit.done();
			}	
		}
		
		var banzai_connected = false;
		test_banzai.on( 'connection', function( socket ){
			if( !banzai_connected ){
				unit.ok( true, 'Connected to Banzai.' );
				banzai_connected = true;
				stageCompleted( );
			}
			
			socket.on( 'register', function( data ){
				unit.ok( true, 'Registered with Banzai.' );
				unit.deepEqual( data.datakeys.sort(), [ 'hello', 'json', 'nested.file' ], 'Expecting initalized datakeys.' );
				
				socket.emit( 'hold-data', { key: 'other.file', type: 'bad', value: 'Nice Day.' } );
				
				stageCompleted( );
			} );
			
			socket.on( 'list-confirmation', function( result ){
				unit.ok( result.success, 'Successfully returned from listing data.' );
				unit.deepEqual( result.keys.sort(), [ 'hello', 'json', 'nested.file' ], 'Correct data.keys returned.' );
				stageCompleted( );
			} );
			
			socket.on( 'err', function( /* error */ ){
				unit.ok( true, 'Successfully through an error.' );
				
				stageCompleted( );
			} );
			
			socket.on( 'hold-confirmation', function( result ){
				unit.ok( !result.success, 'Unsuccessfully returned from losing data.' );
				unit.equal( result.key, 'other.file', 'Correct key returned' );

				socket.emit( 'list-data', {} );
				
				stageCompleted( );
			} );
		} );
		
		test_banzai.listen( 2103 ); 
		
		ed_server = new Ed( );
	}
};