import test from 'ava'
import express from 'express'
import request from 'supertest'
import intercept from './index'

const handler = token => {
  return {
    accessToken: '12345',
    refreshToken: '67890',
    username: 'Lionel',
  }
}

const makeApp = () => {
  const app = express()
  app.get(
    '/refresh',
    intercept({
      handler,
    }),
    (req, res) => {
      res.json(req.user)
    }
  )
  return app
}

test('Response payload', async t => {
  const res = await request(makeApp()).get('/refresh?refreshToken=1234567890')
  t.is(res.status, 200)
  t.is(res.body.username, 'Lionel')
})

test('Response headers', async t => {
  const res = await request(makeApp()).get('/refresh?refreshToken=1234567890')
  t.is(res.headers['x-access-token'], '12345')
  t.is(res.headers['x-refresh-token'], '67890')
})
