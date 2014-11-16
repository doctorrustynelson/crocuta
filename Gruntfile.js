/**
 * Test and Validation file.
 */

'use strict';

module.exports = function( grunt ){

	grunt.initConfig({
		jshint: {
			all: [
				'Gruntfile.js',
				'lib/**/*.js',
				'tests/**/*.js',
				'bin/**/*.js'
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},
		nodeunit: {
			tests: [
				'tests/**/*tests.js'
			],
			options: {
				reporter: 'verbose'
			}
		}
	});
	
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-nodeunit' );
	
	grunt.registerTask( 'test', [ 'jshint', 'nodeunit' ] );
	grunt.registerTask( 'default', [ 'test' ] );
};