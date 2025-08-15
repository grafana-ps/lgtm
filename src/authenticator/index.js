import _ from 'lodash'
import ts from 'taylor-swift'
import {
  getMorganMiddleware,
  getMiddlewareMetrics,
  setupTelemetry,
} from '../lib/util.js'

// OTLP auto instrumentation must happen before module imports
const {
  logger,
} = await setupTelemetry('auth')

// Use dynamic import to allow OTLP auto instrumentation monkey patching
const expressModule = await import('express')
const express = expressModule.default

const PL = _({
  service: 'auth',
})

const STATUS_SAMPLE = _.fill(
  new Array(20),
  200,
).concat([500, 502, 503, 504])

const app = express()

app.use(getMorganMiddleware(logger))
app.use(express.json())
app.use(getMiddlewareMetrics('auth'))

app.get('/', (req, res) => {
  res.send(PL.value())
})

app.post('/authenticate', (req, res) => {
  const username = _.get(req.body, 'username')

  if (!['meredith', 'olivia', 'benjamin'].includes(username)) {
    return res.status(401).send(PL.value())  
  }

  const status = _.sample(STATUS_SAMPLE)
  _.delay(() => res.status(status).send(PL.value()), _.random(100, 500))
})

const port = _.get(process, 'env.LGTM_PORT', 3000)
app.listen(port)
