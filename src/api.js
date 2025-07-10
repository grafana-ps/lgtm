import _ from 'lodash'
import express from 'express'
import promBundle from 'express-prom-bundle'
import {
  setupTracing,
} from './util.js'

const app = express()

setupTracing('api')

const metricsMiddleware = promBundle({
  customLabels: {
    service: 'api',
  },
  includeMethod: true,
  includePath: true,
})

app.use(metricsMiddleware)

app.get('/', (req, res) => {
  res.send({
    service: 'api',
  })
})

app.listen(_.get(process, 'env.API_PORT', 3000))
