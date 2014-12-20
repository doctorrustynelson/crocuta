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
			all: [
				'tests/**/*tests.js'
			],
			banzai: [
			    'tests/banzai-server-tests.js'
			],
			connection: [
			    'tests/connection-manager-tests.js'
			],
			config: [
			    'tests/config-tests.js'
			],
			data: [
			    'tests/data-manager-tests.js',
			    'tests/data-director-tests.js'
			],
			ed: [
			    'tests/ed-server-tests.js'
			],
			filesystem: [
			    'tests/file-system-tests.js'
			],
			integration: [
			    'tests/local-integration-tests.js'
			],
			options: {
				reporter: 'verbose'
			}
		},
		
		coveralls: {
			submit_coverage: {
				src: 'coverage/lcov.info'
			}
		}
	});
	
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-nodeunit' );
	grunt.loadNpmTasks( 'grunt-coveralls' );
	
	grunt.registerTask( 'test', [ 'jshint', 'nodeunit:all' ] );
	grunt.registerTask( 'default', [ 'test' ] );
};