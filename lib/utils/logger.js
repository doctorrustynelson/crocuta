/**
 * Logger definition.
 */

'use strict';

var chalk = require( 'chalk' );

module.exports = function( log_level, name ){
	
	if( name === undefined ){
		name = '-';
	}
	
	return {
		debug: function( anything ){
			if( typeof anything === 'object' ){
				anything = JSON.stringify( anything, null, '    ' );
			}
			
			if( log_level === 'DEBUG' || log_level === 'ALL' ){
				anything.split( '\n' ).forEach( function( line ){
					console.log( chalk.cyan( name + ' [DEBUG] ' ) + line );
				});
			}
		},
		info: function( anything ){
			if( typeof anything === 'object' ){
				anything = JSON.stringify( anything, null, '\t' );
			}
			
			if( log_level === 'DEBUG' || log_level === 'INFO' || log_level === 'ALL' ){
				anything.split( '\n' ).forEach( function( line ){
					console.log( chalk.green( name + ' [INFO]  ' ) + line );
				});
			}
		},
		warn: function( anything ){
			if( typeof anything === 'object' ){
				anything = JSON.stringify( anything, null, '\t' );
			}
			
			if( log_level === 'DEBUG' || log_level === 'INFO' || log_level === 'WARN' || log_level === 'ALL' ){
				anything.split( '\n' ).forEach( function( line ){
					console.log( chalk.yellow( name + ' [WARN]  ' ) + line );
				});
			}
		},
		error: function( anything ){
			if( typeof anything === 'object' ){
				anything = JSON.stringify( anything, null, '\t' );
			}
			
			if( log_level === 'DEBUG' || log_level === 'WARN' || log_level === 'INFO' || log_level === 'ERROR' || log_level === 'ALL' ){
				anything.split( '\n' ).forEach( function( line ){
					console.log( chalk.red( name + ' [ERROR] ' ) + line );
				});
			}
		}
	};
};