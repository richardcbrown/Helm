const express = require("express")
const dotenv = require("dotenv")
const getSiteAuthConfiguration = require("./config/config.siteauth")

dotenv.config()

const app = express()

app.get("/internal/certificate", async (req, res) => {
    const authConfig = await getSiteAuthConfiguration()

    res.writeHead(200, { "Content-Type": "text/plain" })
    res.end(authConfig.publicKey)
})

app.listen(8070, () => console.log(`App listening on port: ${8070}`))
