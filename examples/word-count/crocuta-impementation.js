#!/usr/bin/env node

var fs = require( 'fs' );
var path = require( 'path' );
var crocuta = require( '../../lib/client' )( );

var job = crocuta.createJob( 'word-count' )
    .joule( function( ){
        fileSystem.getKeysUnder( input, function( keys ){
            done( keys.map( function( key ){
                return input + '.' + key;
            } ) );
        } );
    }, 'directory contents' )
        .joule( function( ){
            var mapping = {};
            var count = input.length;

            function callback( key, locations ){
                mapping[ key ] = locations;
                if( --count <= 0 ){
                    done( mapping );
                }
            }

            input.forEach( function( key ){
                fileSystem.getLocationsOf( key, function( locations ){
                callback( key, locations );
            } );
        } );
    }, 'file mapper' )
    .o2mjoule( 'key2loc' ) // Proprietary Joule.
    .joule( function( ){
        done( fileSystem.readSync( input ).toString().split( ' ' ) );
    }, 'content splitter' )
    .m2ojoule( function( ){
        var result = { };
        var keys = Object.keys( input );
        keys.forEach( function( key ){
            input[ key ].forEach( function( input ){
                result[ input ] = ( result[ input ] === undefined ? 1 : result[ input ] + 1 );
            } );
        } );
        done( result );
    }, 'word counter' );

function run( ){
    job.send( function( err, compiled_job ){
        compiled_job.start( 'inputdir', function( err, result ){
             console.log( result );
        } );
    } );
}

fs.readdir( path.resolve( __dirname, 'input' ), function( err, files ){
    var num_files_left = files.length;
    crocuta.onReady( function( ){
        files.forEach( function( file ){
            fs.readFile( path.resolve( __dirname, 'input', file ), function( err, contents ){
                crocuta.upload( 'inputdir.' + file, contents, function( err ){
                    if( --num_files_left == 0 )
                        run( );
                } );
            } );
        } );    
    } );
} );