'use strict';

const seeder = require('..').seeder;
const sinon = require('sinon');
const assert = require('chai').assert;
sinon.assert.expose(assert, {prefix: ""});

describe('loopback-seeder', () => {

  let sandbox = null;

  beforeEach(() => sandbox = sinon.sandbox.create());
  afterEach(() => sandbox.restore());

  describe('#getRandomMatchingObject', () => {
    seeder.cache = {
      group_yellow: {id: 1},
      group_red: {id: 2},
      blue_team: {id: 3}
    };

    it('should give a random matching object (2 results wildcard)', function () {
      const pattern = 'group_*';
      const object = seeder.getRandomMatchingObject(pattern);
      assert.include([seeder.cache.group_yellow, seeder.cache.group_red], object);
    });


    it('should give a random matching object (1 result with wildcard)', function () {
      const pattern = 'blue_.*';
      const object = seeder.getRandomMatchingObject(pattern);
      assert.equal(object, seeder.cache.blue_team);
    });

    it('should give a random matching object (1 result with exact pattern)', function () {
      const pattern = 'blue_team';
      const object = seeder.getRandomMatchingObject(pattern);
      assert.equal(object, seeder.cache.blue_team);
    });
    return it('should give a random matching object (no result)', function () {
      const pattern = 'no_result.*';
      const object = seeder.getRandomMatchingObject(pattern);
      assert.equal(object, undefined);
    });
  });

  describe('#replaceReferenceInObjects', function () {
    describe('should call replaceReferenceInObjects with the right parameters', function () {
      beforeEach(function () {
        seeder.cache = {
          group_yellow: {
            id: 1
          },
          group_red: {
            id: 2
          },
          user: {
            groupId: '@group_yellow'
          }
        };
      });
      beforeEach(function () {
        sandbox.stub(seeder, 'getRandomMatchingObject').callsFake(() => seeder.cache.group_yellow);
      });
      it('with existing reference', function () {
        seeder.replaceReferenceInObjects(seeder.cache.user);
        assert.calledWith(seeder.getRandomMatchingObject, '^group_yellow$');
      });
      it('and replace reference key', function () {
        seeder.replaceReferenceInObjects(seeder.cache.user);
        assert.equal(seeder.cache.user.groupId, 1);
      });
    });
    describe('should call replaceReferenceInObjects with the right parameters', function () {
      beforeEach(function () {
        seeder.cache = {
          group_yellow: {
            id: 1
          },
          group_red: {
            id: 2
          },
          user: {
            groupId: '@group_blue'
          }
        };
      });
      beforeEach(function () {
        sandbox.stub(seeder, 'getRandomMatchingObject').callsFake(() => void 0);
      });
      it('and raised error', function () {
        assert.throw(() => seeder.replaceReferenceInObjects(seeder.cache.user));
      });
    });
  });
});
