var nconf = require('nconf');
var path  = require('path');

// See https://github.com/indexzero/nconf for more info about the configuration scheme.
// In a nutshell, prefs are gathered from these locations lowest to highest precendence:
//   1. config/default.json
//   2. config/<NODE_ENV>.json
//   3. ENV variables
//   4. CLI arguments

// In no NODE_ENV is in the environment, defaults to development

function Config() {
  var environment = process.env.NODE_ENV || 'development';
  nconf.argv()
    .env({ separator: '__', match: /^cas_proxy__/, lowerCase: true })
    .file(environment, path.join(process.cwd(), 'config', environment.toLowerCase() + '.json'))
    .file('default', path.join(process.cwd(), 'config/default.json'));
}

Config.prototype.get = function(key) {
  return nconf.get(key);
};

module.exports = new Config();
