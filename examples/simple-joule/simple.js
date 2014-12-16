
var crocuta = require( '../../lib/client' );

var job = crocuta.createJob( 'hello world' ).joule( function( input, output, reporter ){
	console.log( arguments );
	console.log( 'Hello Crocuta!' );
	return 'Hello User!';
});

crocuta.onReady( function( ){
	job.send( function( result ){
		console.log( 'Complete' )
		console.log( result );
	});
} )

