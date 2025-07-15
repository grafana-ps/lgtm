import _ from 'lodash'
import express from 'express'
import basicAuth from 'express-basic-auth'
import ts from 'taylor-swift'
import {
  getMiddlewareMetrics,
  setupTracing,
} from './util.js'

const PL = _({
  service: 'api',
})

const app = express()

setupTracing('api')

app.use(getMiddlewareMetrics('api'))

app.use(basicAuth({
  authorizer: async (username, password, cb) => {
    try {
      const response = await fetch(
        'http://localhost:3001/authenticate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            password
          }),
        }
      )

      if (response.status === 401) {
        return cb(null, false)
      }

      if (response.status === 200) {
        return cb(null, true)
      }

      return cb(response.statusText)
    } catch (error) {
      return cb(error)
    }
  },
  authorizeAsync: true,
}))

app.all('/v13/:album', (req, res) => {
  try {
    const album = ts.album.get(_.replace(req.params.album, '-', ' '))

    _.delay(
      () => res
        .status(200)
        .send(PL.extend({ album }).value()),
      _.random(100, 60000)
    )
  } catch (error) {
    res.status(404).send(PL.value())
  }
})

app.listen(_.get(process, 'env.API_PORT', 3000))
