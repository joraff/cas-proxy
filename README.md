# CAS Authentication Proxy

CAS Authentication Proxy is a lightweight node.js/express 4 application that provides CAS authentication to a destination by proxying access. It was originally created to serve static content, but since the destination routes are completely customizable using standard Express routing it can be configured to proxy almost any other service.

Unlike other lightweight CAS proxies, CAS Authentication Proxy supports session tokens for faster request processing and reduced validation requests to your CAS servers.

## Usage


CAS Authentication Proxy should be used as middleware behind a load balancer and SSL terminator, but in front of your content or server. It is not intended to be used directly as a front end web server.

## Configuration

You may use any combination of configuration files, environment variables, or command line arguments. The order of precedence for configuration parameters is

1. `config/default.json` (lowest precedence)
2. `config/<NODE_ENV>.json`
3. `CAS_PROXY_<PARAMETER>` environment variables
4. Command line arguments (highest precedence)

### Config Parameters

Parameter     | ENV var name  | Default | Description
------------- | ------------- | ------- | -----------
`app:base_url` | `CAS_PROXY__APP__BASE_URL` | `http://localhost:8000` | The base URL for your application or content. Used to popular the CAS `service` parameter
`app:port` | `CAS_PROXY__APP__PORT` | 8000 | Port that express listens on
`app:session_secret` | `CAS_PROXY__APP__SESSION_SECRET` | `my secret` | Secret used for signing cookie data
`cas:base_url` | `CAS_PROXY__CAS__BASE_URL` | | Base url for your CAS server. Required
`cas:renew` | `CAS_PROXY__CAS__RENEW` | `false` | Forces presentation of primary credentials when session is initialized

## Routes

CAS Authentication Proxy does not contain any default routes and requires a `routes.js` file in the root of the application. Middleware for requiring authentication is provided in `cas.js`, or you may build your own in your router.

### Example `router.js`

``` javascript
const router = require( 'express').Router()
const cas = require( './cas' )

// Use it as path middleware
router.use('/', cas)

// Or specific route middleware
router.get('/', cas, function(req, res) {
  // ...
})

// Useful if you're serving static content mounted at /www
// Redirects to another url on a sendFile error
router.use(function( req, res, next ) {
  res.sendFile( require('path').join('/www', req.url), function(e) {
    if(e) {
      console.log(e)
      res.redirect('https://myhomepage.com/404.html')
    }
  })
})
```
