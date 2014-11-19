var io = require( 'socket.io' )( );

io.on( 'connection', function( socket ){
	console.log( 'connection' );
	
	socket.emit( 'hi event', { key: 'value' } );
	
	socket.on( 'hello event', function( data ){
		console.log( 'data' + JSON.stringify( data ) );
	} );
	
	socket.on( 'disconnect', function( ){
		console.log( 'disconnect' );
	} );
} );

io.listen( 3000 );