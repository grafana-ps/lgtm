import _ from 'lodash'
import express from 'express'
import ts from 'taylor-swift'
import {
  getMiddlewareMetrics,
  setupTracing,
} from '../lib/util.js'

const PL = _({
  service: 'auth',
})

const STATUS_SAMPLE = _.fill(new Array(20), 200).concat([500, 502, 503, 504])

const app = express()

setupTracing('auth')

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

app.listen(_.get(process, 'env.LGTM_PORT', 3000))
