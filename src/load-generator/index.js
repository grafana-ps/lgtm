import _ from 'lodash'
import express from 'express'
import { faker } from '@faker-js/faker'
import ts from 'taylor-swift'
import {
  getMiddlewareMetrics,
  setupTracing,
} from '../lib/util.js'

const LGTM_API = _.get(process, 'env.LGTM_API')

if (!LGTM_API) {
  throw new Error('LGTM_API is not set')
}

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

  try {
    const response = await fetch(
      `${LGTM_API}/v13/${album}`,
      {
        headers,
        method,
      }
    )
  } catch (e) {
    console.error(e)
  }
}

setInterval(() => {
  _.delay(requestApi, _.random(0, 1000))
}, 250)

app.listen(_.get(process, 'env.LGTM_PORT', 3000))
