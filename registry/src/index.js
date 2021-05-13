const path = require("path")
const express = require("express")
const cors = require("cors")

const PORT = 8882

const app = express()

app.use(
    cors({
        origin: "*",
        credentials: true,
    })
)

app.post("/registry/search", (req, res) => {
    const config = {
        panels: [
            {
                id: "1",
                libraryId: "1",
                panelTag: "helm-sample-component",
                libraryRoot: "http://localhost:8881",
                panelPath: `/SampleComponent.js`,
                panelName: "sample-panel",
            },
        ],
    }

    return res.status(200).json(config)
})

app.listen(PORT, () => console.log(`App listening on ${PORT}`))
