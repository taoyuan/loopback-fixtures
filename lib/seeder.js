'use strict';

const debug = require('debug')('loopback:seeder');
const _ = require('lodash');
const faker = require('faker');
const fs = require('fs');
const path = require('path');
const PromiseA = require('bluebird');
const YAML = require('yamljs');
const traverse = require('traverse');

const ID_KEY = 'id';
const REG_IDENTIFIER = /(\w+){(\d+)..(\d+)}$/;

/**
 * @class Seeder
 */
class Seeder {
  constructor() {
    this.cache = {};
  }

  /**
   *
   * Seed
   *
   * @param {Object} options
   * @param {Object} options.models
   * @param {String} [options.dir]
   * @param {Boolean} [options.errorOnFailure]
   */
  seed(options) {
    options = Object.assign({
      dir: path.resolve(process.cwd(), 'server/seeds'),
      errorOnFailure: false,
    }, options);

    const dir = path.resolve(options.dir);
    let files = fs.readdirSync(dir);
    files = files.filter(file => file.match(/\.ya?ml$/));
    return PromiseA.map(files, file => {
      const data = YAML.load(path.resolve(dir, file));
      return this._seed(options.models, data, options);
    })
  }

  clearDatabase(models) {
    return PromiseA
      .filter(models, model => _.isFunction(model.destroyAll))
      .map(model => PromiseA.fromCallback(cb => model.destroyAll(cb)));
  }

  getRandomMatchingObject(pattern) {
    const regex = new RegExp(pattern);
    const items = _.filter(this.cache, (v, k) => !_.isEmpty(k.match(regex)));
    return _.sample(items);
  }

  replaceReferenceInObjects(object) {
    const that = this;
    traverse(object).forEach(function(value) {
      if (!_.isString(value) || value[0] !== '@') {
        return;
      }
      const identifier = value.substr(1);
      const ref = that.getRandomMatchingObject(`^${identifier}$`);
      if (ref && ref[ID_KEY]) {
        this.update(ref[ID_KEY]);
      } else {
        throw new Error('Please provide object for @' + identifier);
      }
    });
    return object;
  }

  _resolveWithGenerators(data) {
    const answer = {};
    _.forEach(data, (item, identifier) => {
      const m = identifier.match(REG_IDENTIFIER);
      if (m && m.length === 4) {
        identifier = m[1];
        const min = parseInt(m[2]);
        const max = parseInt(m[3]);
        for (let i = min; i <= max; i++) {
          answer[identifier + i] = _.clone(item);
          traverse(answer[identifier + i]).forEach(function(value) {
            if (typeof value === 'string') {
              this.update(value.replace('{@}', i.toString()));
            }
          });
        }
      } else {
        answer[identifier] = item;
      }
    });
    return answer;
  }

  _resolveWithFaker(data) {
    _.forEach(data, item => {
      traverse(item).forEach(function(value) {
        if (typeof value === 'string') {
          this.update(faker.fake(value));
        }
      });
    });
    return data;
  }

  _resolveWithFunctions(data) {
    _.forEach(data, item => {
      traverse(item).forEach(function(value) {
        if (typeof value === 'string') {
          try {
            this.update(eval(value));
          } catch (e) {
            // no-op
          }
        }
      });
    });
    return data;
  }

  _resolve(data) {
    data = this._resolveWithGenerators(data);
    data = this._resolveWithFaker(data);
    data = this._resolveWithFunctions(data);
    return data;
  }

  _seed(models, data, options) {
    data = _.map(data, (data, name) => ({name, data}));

    return PromiseA.each(data, item => {
      item.data = this._resolve(item.data);
      const entries = _.map(item.data, (object, identifier) => ({identifier, object}));
      return PromiseA.map(entries, entry => {
        const object = this.replaceReferenceInObjects(entry.object);
        return PromiseA.fromCallback(cb => models[item.name].create(object, cb))
          .then(instance => this.cache[entry.identifier] = instance)
          .then(instance => console.log(`[${item.name}] - ${entry.identifier} imported (id: ${instance[ID_KEY]})`))
          .catch(err => {
            debug('Error when attempting to seed for', object);
            if (options.errorOnFailure) {
              throw err;
            }
            debug(err);
          })
      });
    });
  }
}

/**
 *
 * @type {Seeder}
 */
exports = module.exports = new Seeder();
exports.Seeder = Seeder;
