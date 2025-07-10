import express from 'express'

const app = express()

app.get('/', (req, res) => {
  res.send({
    service: 'api',
  })
})

app.listen(3000)
