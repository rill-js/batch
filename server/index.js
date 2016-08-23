'use strict'
var url = require('url')
var fetch = require('node-fetch')
var assign = require('object-assign')
var promiseLimit = require('promise-limit')

/*
 * A Rill middleware that will run batch requests to the current server.
 */
module.exports = function (opts) {
  opts = opts || {}
  opts.from = opts.from || 'query'
  var forward = 'forwardIP' in opts ? opts.forwardIP : true
  var limitRequests = opts.limit ? opts.limit : 10
  var limitConcurrency = opts.concurrency ? promiseLimit(opts.concurrency) : noLimit

  if (opts.from !== 'query' && opts.from !== 'body') {
    throw new TypeError('@rill/batch: opts.from must be "query" or "body".')
  }

  return function batchMiddleware (ctx) {
    var req = ctx.req
    var res = ctx.res
    var headers = req.headers
    var assert = ctx.assert
    var href = req.href
    var endpoints = req[opts.from]
    var result = {}
    var keys = Object.keys(endpoints)

    assert(keys.length < limitRequests, 400, 'Could not batch ' + keys.length + ' requests, the limit is ' + limitRequests + '.')
    if (forward) headers = assign({ 'X-Forwarded-For': req.ip }, headers)

    return Promise.all(keys.map(function (key) {
      return limitConcurrency(function () {
        var path = url.resolve(href, endpoints[key])
        return fetch(path, { method: 'GET', headers: headers }).then(function (res) {
          return parseBody(res).then(function (body) {
            result[key] = {
              status: res.status,
              headers: res.headers.raw(),
              body: body
            }
          })
        })
      })
    })).then(function () {
      res.body = result
    })
  }
}

/**
 * Parse a node-fetch response body using JSON if possible and fall back to text.
 */
function parseBody (res) {
  var contentType = res.headers.get('Content-Type')
  if (contentType.split(';')[0] === 'application/json') return res.json()
  return res.text()
}

/**
 * Invokes a provided function. (Used as the default limit option).
 */
function noLimit (fn) { return fn() }
