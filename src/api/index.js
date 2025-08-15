import _ from 'lodash'
import basicAuth from 'express-basic-auth'
import ts from 'taylor-swift'

import {
  getMiddlewareMetrics,
  getMorganMiddleware,
  setupTelemetry,
} from '../lib/util.js'

// OTLP auto instrumentation must happen before module imports
const {
  logger,
} = await setupTelemetry('api')

// Use dynamic import to allow OTLP auto instrumentation monkey patching
const expressModule = await import('express')
const express = expressModule.default

const PL = _({
  service: 'api',
})

const LGTM_AUTH = _.get(process, 'env.LGTM_AUTHENTICATOR')

if (!LGTM_AUTH) {
  throw new Error('LGTM_AUTHENTICATOR is not set')
}

const app = express()

app.use(getMorganMiddleware(logger))
app.use(express.json())
app.use(getMiddlewareMetrics('api'))

app.get('/', (req, res) => {
  res.status(200).send(PL.value())
})

app.use(basicAuth({
  authorizer: async (username, password, cb) => {
    try {
      const response = await fetch(
        `${LGTM_AUTH}/authenticate`,
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

app.listen(_.get(process, 'env.LGTM_PORT', 3000))
