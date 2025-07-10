import _ from 'lodash'
import express from 'express'
import promBundle from 'express-prom-bundle'

const app = express()
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
