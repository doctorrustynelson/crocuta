/**
 * New node file
 */

function FileSystem( data_manager/*, banzai_socket */ ){
	
	this.exists = function( key ){
		data_manager.has( key );
	};
	
	this.read = function( key, callback ){
		data_manager.get( key, callback );
	};
	
	this.readSync = function( key ){
		return data_manager.getSync( key );
	};
	
}

module.exports = FileSystem;