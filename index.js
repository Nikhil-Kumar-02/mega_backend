const express = require('express')
const app = express()
require('dotenv').config();
const port = process.env.PORT || 4500;

const connectDB = require('./config/database');

app.get('/', (req, res) => {
  res.send('Hello World!')
})


connectDB();
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})