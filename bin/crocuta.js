#!/usr/bin/env node

var commander = require( 'commander' );
var version = require( '../package.json' ).version;
var commands = require( '../lib/cli/commands' );

commander
	.version( version )
	.option( '-d, --detach', 'Detach spawned processes.' );

//Link crocuta version to crocuta --version
commander
	.command( 'version' )
	.description( 'The version of crocuta installed.' )
	.action( function( ){
		console.log( version );
	} );


// Link crocuta help to crocuta --help
commander
	.command( 'help' )
	.description( 'Overview of crocuta cli (this).' )
	.action( function( ){
		commander.help();
	} );

commander
	.command( 'start <server/cluster-type>' )
	.description( 'Start the specified server or cluster type.' )
	.action( function( server ){
		switch( server ){
			case 'ed':
				commands.startEd( commander.detach );
				break;
			case 'banzai':
				commands.startBanzai( commander.detach );
				break;
			case 'shenzi':
				commands.startShenzi( commander.detach );
				break;
			case 'local':
				/* falls through */
			default:
				if( !commander.detach ){
					console.error( 'Must detach when spawning all three servers.' );
					console.error( '\tcrocuta start --detach' );
					process.exit( 1 );
				}
				break;
		}
	} );

//Unrecognized 
commander
	.command( '*' )
	.description( '' )
	.action( function( ){
		console.log( 'Unrecognized ynpm command.  For more help using crocuta run "crocuta help".' );
	} );

// Process arguments
commander.parse( process.argv );
