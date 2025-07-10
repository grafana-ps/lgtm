import _ from 'lodash'
import express from 'express'
import {
  getMiddlewareMetrics,
  setupTracing,
} from './util.js'

const app = express()

setupTracing('api')

app.use(getMiddlewareMetrics('api'))

app.get('/', (req, res) => {
  res.send({
    service: 'api',
  })
})

app.listen(_.get(process, 'env.API_PORT', 3000))
