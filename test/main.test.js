'use strict'

var test = require('tape')
var agent = require('supertest').agent
var rill = require('rill')
var rillBody = require('@rill/body')
var batch = require('../server')

test('Handles batch requests with GET and query', function (t) {
  t.plan(4)

  var request = agent(rill()
    .get('/batch', batch())
    .get('/page1', function (ctx) {
      ctx.res.status = 200
      ctx.res.body = 'test1'
      t.pass('fetched page 1')
    })
    .get('/page2', function (ctx) {
      ctx.res.status = 200
      ctx.res.body = { test: 'test2' }
      t.pass('fetched page 2')
    })
    .listen().unref())

  // Do the batch request.
  request
    .get('/batch')
    .query({
      page1: '/page1',
      page2: '/page2'
    })
    .expect(200)
    .then(function (res) {
      t.equal(res.body.page1.body, 'test1', 'should fetch page 1 as text')
      t.deepEqual(res.body.page2.body, { test: 'test2' }, 'should fetch page 2 as json')
    }, t.fail)
})

test('Handles batch requests with POST and body', function (t) {
  t.plan(4)

  var request = agent(rill()
    .use(rillBody())
    .post('/batch', batch({ from: 'body' }))
    .get('/page1', function (ctx) {
      ctx.res.status = 200
      ctx.res.body = 'test1'
      t.pass('fetched page 1')
    })
    .get('/page2', function (ctx) {
      ctx.res.status = 200
      ctx.res.body = { test: 'test2' }
      t.pass('fetched page 2')
    })
    .listen().unref())

  // Do the batch request.
  request
    .post('/batch')
    .send({
      page1: '/page1',
      page2: '/page2'
    })
    .expect(200)
    .then(function (res) {
      t.equal(res.body.page1.body, 'test1', 'should fetch page 1 as text')
      t.deepEqual(res.body.page2.body, { test: 'test2' }, 'should fetch page 2 as json')
    }, t.fail)
})

test('Handles batch requests with a concurrency limit', function (t) {
  t.plan(5)

  var started = new Date()
  var request = agent(rill()
    .get('/batch', batch({ concurrency: 1 }))
    .use(function (ctx, next) {
      // Sleep for 1s to ensure concurrency is working.
      return new Promise(function (resolve) {
        setTimeout(resolve, 500)
      }).then(next)
    })
    .get('/page1', function (ctx) {
      ctx.res.status = 200
      ctx.res.body = 'test1'
      t.pass('fetched page 1')
    })
    .get('/page2', function (ctx) {
      ctx.res.status = 200
      ctx.res.body = { test: 'test2' }
      t.pass('fetched page 2')
    })
    .listen().unref())

  // Do the batch request.
  request
    .get('/batch')
    .query({
      page1: '/page1',
      page2: '/page2'
    })
    .expect(200)
    .then(function (res) {
      t.ok(hasElapsed(1000), '1 second has elapsed')
      t.equal(res.body.page1.body, 'test1', 'should fetch page 1 as text')
      t.deepEqual(res.body.page2.body, { test: 'test2' }, 'should fetch page 2 as json')
    }, t.fail)

  // Check if a certain duration has elapsed with 25ms tolerance.
  function hasElapsed (ms) {
    var diff = +new Date() - started
    return diff >= ms && diff < ms + 50
  }
})
