/**
 * New node file
 */

//var config = require( '../utils/config' );
var path = require( 'path' );
var spawn = require('child_process').spawn;

if( !process.env.CROCUTA_CONFIG ){
	process.env.CROCUTA_CONFIG = path.resolve( __dirname, '..', '..', 'config', 'local.config.json' );
}

module.exports = {
	
	startEd: function( detach ){
		var child = spawn( 
			'node', 
			[ 
			  	'./lib/cli/servers/spawn-ed-server.js' 
			], { 
				cwd: path.resolve( __dirname, '..', '..' ),
				detached: detach || false,
				stdio: 'inherit'
			}
		);

		if( detach ){
			child.unref();
		}
	},
	
	startBanzai: function( detach ){
		var child = spawn( 
			'node', 
			[ 
			  	'./lib/cli/servers/spawn-banzai-server.js' 
			], { 
				cwd: path.resolve( __dirname, '..', '..' ),
				detached: detach || false,
				stdio: 'inherit'
			}
		);

		if( detach ){
			child.unref();
		}
	},
	
	startShenzi: function( detach ){
		var child = spawn( 
			'node', 
			[ 
			  	'./lib/cli/servers/spawn-shenzi-server.js' 
			], { 
				cwd: path.resolve( __dirname, '..', '..' ),
				detached: detach || false,
				stdio: 'inherit'
			}
		);

		if( detach ){
			child.unref();
		}
	},
	
	getServers: function( ){
		
	}
	
};