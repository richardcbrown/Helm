const path = require("path")
const express = require("express")

const PORT = 8882

const app = express()

app.listen(PORT, () => console.log(`App listening on ${PORT}`))
