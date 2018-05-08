'use strict';

const path = require('path');
const PromiseA = require('bluebird');
const seeder = require('./lib/seeder');

exports = module.exports = function (app, options) {
  options = Object.assign({
    autoLoad: false,
    migrate: false
  }, options);

  const seed = app.seed = opts => {
    opts = Object.assign({}, options, opts, { models: app.models });
    return PromiseA.try(() => {
      if (opts.migrate) {
        console.log('Clear Database');
        return seeder.clearDatabase(opts.models);
      }
    }).then(() => seeder.seed(opts));
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
