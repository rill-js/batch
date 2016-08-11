'use strict'
var fetch = require('node-fetch')
var promiseLimit = require('promise-limit')

/*
 * A Rill middleware that will run batch requests to the current server.
 */
module.exports = function (opts) {
  opts = opts || {}
  opts.from = opts.from || 'query'
  var limit = opts.limit ? promiseLimit(opts.limit) : noLimit

  if (opts.from !== 'query' && opts.from !== 'body') {
    throw new TypeError('@rill/batch: opts.from must be "query" or "body".')
  }

  return function batchMiddleware (ctx) {
    var req = ctx.req
    var res = ctx.res
    var origin = req.origin
    var endpoints = req[opts.from]
    var result = {}
    return Promise.all(Object.keys(endpoints).map(function (key) {
      return limit(function () {
        var path = origin + endpoints[key]
        return fetch(path, { method: 'GET', headers: req.headers }).then(function (res) {
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
