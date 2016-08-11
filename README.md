[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Chat about Rill at https://gitter.im/rill-js/rill](https://badges.gitter.im/rill-js/rill.svg)](https://gitter.im/rill-js/rill?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# Rill Batch
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

+ **batch({ from: 'query' || 'body', limit: Infinity })** : Creates a middleware that will batch api requests.

```javascript
// Handle batch requests at 'GET /batch' using request query.
app.get('/batch', batch({ from: 'query' }))

// Handle batch requests at 'POST /patch' using request body.
app.post('/batch', batch({ from: 'body' }))

// Limit batch request concurrency to 5 (default is infinity).
app.get('/batch', batch({ limit: 5 }))
```
---

### Contributions

* Use `npm test` to run tests.

Please feel free to create a PR!
