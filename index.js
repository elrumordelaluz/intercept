const fetch = require('node-fetch')

const intercept = ({ url, errorHandler, getToken } = {}) => {
  return async (req, res, next) => {
    if (req.user) {
      return next()
    }

    try {
      const refreshToken = getToken(req)

      if (refreshToken) {
        const requestOptions = {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + refreshToken,
            'Content-Type': 'application/json',
          },
        }
        const response = await fetch(url, requestOptions)
        const user = await response.json()
        req.user = user
        res.set(
          'Access-Control-Expose-Headers',
          'x-access-token, x-refresh-token'
        )
        res.set('x-access-token', req.user.accessToken)
        res.set('x-refresh-token', req.user.refreshToken)
        next()
      } else {
        throw 'No refresh token passed'
      }
    } catch (err) {
      typeof errorHandler === 'function' ? errorHandler(err) : next(err)
    }
  }
}

module.exports = intercept
