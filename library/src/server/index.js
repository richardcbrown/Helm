const path = require("path")
const express = require("express")
const cors = require("cors")

const PORT = 8881

const app = express()

app.use(
    cors({
        origin: "*",
        credentials: true,
    })
)

console.log(path.join(__dirname, "../../dist"))

app.use("/", express.static(path.join(__dirname, "../../dist")))

app.listen(PORT, () => console.log(`App listening on ${PORT}`))
