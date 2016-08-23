<h1 align="center">
  <!-- Logo -->
  <img src="https://raw.githubusercontent.com/rill-js/rill/master/Rill-Icon.jpg" alt="Rill"/>
  <br/>
  @rill/batch
	<br/>

  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square" alt="API stability"/>
  </a>
  <!-- Standard -->
  <a href="https://github.com/feross/standard">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square" alt="Standard"/>
  </a>
  <!-- NPM version -->
  <a href="https://npmjs.org/package/@rill/batch">
    <img src="https://img.shields.io/npm/v/@rill/batch.svg?style=flat-square" alt="NPM version"/>
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/@rill/batch">
    <img src="https://img.shields.io/npm/dm/@rill/batch.svg?style=flat-square" alt="Downloads"/>
  </a>
  <!-- Gitter Chat -->
  <a href="https://gitter.im/rill-js/rill">
    <img src="https://img.shields.io/gitter/room/rill-js/rill.svg?style=flat-square" alt="Gitter Chat"/>
  </a>
</h1>

Batch API requests with Rill.

If you need to perform several different requests to your API simultaneously, you could combine them all together (in one querystring or body) and send only one request to the server, improving latency in the browser.

Currently, only `GET` requests can be batched.

# Installation

#### Npm
```console
npm install @rill/batch
```

# Example

#### app.js

```js
const app = rill()
const batch = require("@rill/batch")
const loadUser = require('./load-user.js')

// Setup the middleware.
app.get('/batch', batch())

// Example routes.
app.get("/page1", ({ res })=> {
	res.body = { name: 'page1' }
})

app.get("/page2", ({ res })=> {
	res.body = { name: 'page2' }
})
```

#### somewhere.js

```js
fetch('myapi.com/batch?a=/page1&b=/page2')
	.then((res)=> res.json())
	.then((data)=> {
		/**
		 * {
		 * 	a: { status: 200, headers: {...}, body: { name: 'page1' } }
		 * 	b: { status: 200, headers: {...}, body: { name: 'page2' } }
		 * }
		 */
	})
```

# API

+ **batch({ from: 'query' || 'body', concurrency: Infinity, forwardIP: true })** : Creates a middleware that will batch api requests.

```javascript
// Handle batch requests at 'GET /batch' using request query.
app.get('/batch', batch({ from: 'query' }))

// Handle batch requests at 'POST /patch' using request body.
app.post('/batch', batch({ from: 'body' }))

// Limit concurrent batch request to 5 (default is infinity).
app.get('/batch', batch({ concurrency: 5 }))

// Disable automatic `X-Forwarded-For` header.
app.get('/batch', batch({ forwardIP: false }))
```
---

### Contributions

* Use `npm test` to run tests.

Please feel free to create a PR!
