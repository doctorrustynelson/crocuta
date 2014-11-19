var socket = require( 'socket.io-client' )( 'http://localhost:3000' );

socket.on( 'connect', function( ){

	console.log( 'connection' );
	
	socket.on( 'hi event', function( data ){
		console.log( 'data' + JSON.stringify( data ) );
	} );
	
	socket.emit( 'hello event', "HELLO" );
	
	socket.on( 'disconnect', function( ){
		console.log( 'disconnect' );
	} );
} );