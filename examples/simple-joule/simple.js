#!/usr/bin/env node

var crocuta = require( '../../lib/client' )( );

var job = crocuta.createJob( 'hello world' ).joule( function( ){
	console.log( 'Hello Crocuta!' );
	done( 'Hello User!' );
});

crocuta.onReady( function( ){
	job.send( function( err, compiled_job ){
		compiled_job.start( undefined, function( err, result ){ 
			console.log( 'Complete' )
			console.log( result );
			crocuta.stop( );
		} );
	} );
} )

