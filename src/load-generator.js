import _ from 'lodash'
import express from 'express'
import { faker } from '@faker-js/faker'
import ts from 'taylor-swift'
import {
  getMiddlewareMetrics,
  setupTracing,
} from './util.js'

const ALBUMS = ts.album.all().map((a) => a.title)
const USERNAMES = ['meredith', 'olivia', 'benjamin']

const app = express()

setupTracing('load-generator')

app.use(getMiddlewareMetrics('load-generator'))

app.get('/', (req, res) => {
  res.send({
    service: 'load-generator',
  })
})

async function requestApi() {
  const method = _.sample([
    'GET',
    'POST',
    'PUT',
    'DELETE',
  ])

  const username = _.sample([faker.internet.username()].concat(USERNAMES))
  const password = _.sample([faker.internet.password(), 'alltoowelltmvtvftv'])
  const token = Buffer.from(`${username}:${password}`, 'utf-8').toString('base64')

  const headers = new Headers()

  headers.set('Authorization', `Basic ${token}`)
  headers.set('Content-Type', 'application/json')

  const album = _.kebabCase(
    _.sample(
      [faker.hacker.noun()].concat(ALBUMS),
    ),
  )

  const response = await fetch(
    `http://localhost:3000/v13/${album}`,
    {
      headers,
      method,
    }
  )
}

setInterval(() => {
  _.delay(requestApi, _.random(0, 1000))
}, 250)

app.listen(_.get(process, 'env.LOAD_GENERATOR_PORT', 8080))
