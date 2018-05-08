'use strict';

const path = require('path');
const seeder = require('./lib/seeder');

exports = module.exports = function (app, options) {
  options = Object.assign({
    autoLoad: false,
    migrate: false
  }, options);

  const seed = app.seed = opts => {
    opts = Object.assign({}, options, opts);
    return (new Promise((resolve, reject) => {
      if (!opts.migrate) return resolve();
      console.log('Clear Database');
      seeder.clearDatabase(opts.models).then(resolve).catch(reject);
    })).then(() => seeder.seed(opts));
  };

  if (options.autoLoad) {
    return seed();
  }
};

/**
 *
 * @type {Seeder}
 */
exports.seeder = seeder;

exports.Seeder = seeder.Seeder;
