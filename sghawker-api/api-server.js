// Register babel to have ES6 support on the NodeJS server
require('babel-register')({
  presets: ['es2015', 'stage-0'],
  plugins: ['add-module-exports']
});

// Browser ES6 Polyfill
require('babel-polyfill');

// Start the server app
require('./src');
