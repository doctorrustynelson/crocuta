

var crocuta = require( '../../lib/client' );

var job = crocuta.createJob( 'hello world' ).joule( function( input, output, reporter ){
	console.log( arguments );
	console.log( 'Hello Crocuta!' );
});

crocuta.onReady( function( ){
	job.send( function( result ){
		console.log( 'Complete' )
	});
} )

