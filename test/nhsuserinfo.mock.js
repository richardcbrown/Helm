const express = require("express")

const app = express()

app.get("/userinfo", (req, res) => {
    const { nhsNumber } = req.query

    res.status(200).send(
        JSON.stringify({
            family_name: "OHUPHONGWATTHANA",
            given_name: "HAYLEE",
            nhs_number: nhsNumber,
            birthdate: "1994-09-08",
        })
    )
})

app.listen(9999)
