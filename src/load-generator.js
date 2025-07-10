import _ from 'lodash'
import express from 'express'
import {
  getMiddlewareMetrics,
  setupTracing,
} from './util.js'

const app = express()

setupTracing('load-generator')

app.use(getMiddlewareMetrics('load-generator'))

app.get('/', (req, res) => {
  res.send({
    service: 'load-generator',
  })
})

app.listen(_.get(process, 'env.LOAD_GENERATOR_PORT', 3001))
