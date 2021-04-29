const path = require("path")
const express = require("express")

const PORT = 8881

const app = express()

app.use("/", express.static(path.join(__dirname, "../dist")))

app.listen(PORT, () => console.log(`App listening on ${PORT}`))
