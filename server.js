const express = require('express')
const path = require('path')

const app = express()

const port = 2000

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, '/public/html/index.html'))

})

app.get('/new', (req, res) => {

    res.sendFile(path.join(__dirname, '/public/html/coordinator_config.html'))

})

app.listen(port, () => {

    console.log(`Server listening at http://localhost:${port}`)

})
