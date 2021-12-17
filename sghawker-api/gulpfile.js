'use strict';

// import { gulp } from 'gulp';
var gulp = require('gulp');
var _ = require('lodash');
var argv = require('yargs').argv;
var spawn = require('child_process').spawn;

/**
 * Run API Server in development environment
 */
gulp.task('api-dev', () => {
  var developmentEnv = _.cloneDeep(process.env);
  developmentEnv.NODE_ENV = 'development';
  return spawn('nodemon', ['-w', 'src/common', '-w', 'src', 'api-server.js'], {
    env: developmentEnv,
    stdio: 'inherit'
  });
});
