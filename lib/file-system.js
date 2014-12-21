/**
 * New node file
 */

function FileSystem( data_manager, banzai_socket ){
	
	this.existsLocally = function( key ){
		data_manager.has( key );
	};
	
	this.read = function( key, callback ){
		data_manager.get( key, callback );
	};
	
	this.readSync = function( key ){
		return data_manager.getSync( key );
	};
	
	this.getLocationsOf = function( key, callback ){
		banzai_socket.emit( 'getLocationsOf', key, callback );
	};
	
}

module.exports = FileSystem;