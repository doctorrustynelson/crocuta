/**
 * New node file
 */

var fs = require( 'fs' );
var path = require( 'path' );
var input_folder = './input';
var output_folder = './output';

fs.readdir( input_folder, function( err, files ){
	
	var num_files_left = files.length;
	var results = [];
	
	function finishedMappingFile( result ){
		
		results.push( result );
		
		if( --num_files_left <= 0){
			var output = results.reduce( function( prev, curr ){
				for( var key in curr ){
					if( curr.hasOwnProperty( key )){
						prev[key] = ( prev[curr] !== undefined ? prev[curr] + curr[key] : curr[key] );
					}
				}
				return prev;
			}, {} );
			
			fs.writeFile( path.join( output_folder, Date.now() + '.result' ), JSON.stringify( output, null, '\t' ), function( err ){
				console.log( 'Done.' );
			} );
		}
	};
	
	
	files.forEach( function( file ){
		fs.readFile( path.join( input_folder, file ), function( err, contents ){			
			finishedMappingFile( contents.toString().split( ' ' ).reduce( function( prev, curr ){
				prev[curr] = ( prev[curr] !== undefined ? prev[curr] + 1 : 1 );
				return prev;
			}, {} ) );
		} );
	} );
} );
