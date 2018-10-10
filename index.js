const fetch = require('node-fetch')

const catchToken = (req, key) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    return req.headers.authorization.split(' ')[1]
  } else if (req.query && req.query[key]) {
    return req.query[key]
  } else if (req.cookies && req.cookies[key]) {
    return req.cookies[key]
  } else if (req.body && req.body[key]) {
    return req.body[key]
  }
  return null
}

const intercept = ({
  url,
  errorHandler,
  getToken,
  key = 'refreshToken',
  handler,
} = {}) => {
  return async (req, res, next) => {
    if (req.user) {
      return next()
    }

    try {
      const _token = getToken ? getToken(req) : catchToken(req, key)
      if (_token) {
        let user = null
        if (url) {
          const requestOptions = {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${_token}`,
              'Content-Type': 'application/json',
            },
          }
          const response = await fetch(url, requestOptions)
          user = await response.json()
        }

        if (handler && typeof handler === 'function') {
          user = await handler(_token)
        }

        req.user = user
        if (user) {
          res.set(
            'Access-Control-Expose-Headers',
            'x-access-token, x-refresh-token'
          )
          res.set('x-access-token', req.user.accessToken)
          res.set('x-refresh-token', req.user.refreshToken)
        }
      }
      next()
    } catch (err) {
      console.log({ err })
      typeof errorHandler === 'function' ? next(errorHandler(err)) : next(err)
    }
  }
}

module.exports = intercept
