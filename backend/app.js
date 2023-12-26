const express = require("express")
const path = require("path")
const { readFileSync } = require("fs")
const cors = require("cors")
require("dotenv").config()
const helmet = require("helmet")
const swaggerUi = require("swagger-ui-express")

const dirPath = __dirname

let swaggerPath
let swaggerDocument
let swaggerCustom

if (process.env.ENV !== "vercel") {
    swaggerPath = path.join(dirPath, "./swagger.json")
    swaggerDocument = JSON.parse(readFileSync(swaggerPath))
} else {
    // Obligé de faire comme ça pour Vercel sinon ça ne fonctionne pas
    swaggerCustom = {
        customCssUrl: "https://unpkg.com/swagger-ui-dist@4.3.0/swagger-ui.css",
        customJs: [
            "https://unpkg.com/swagger-ui-dist@4.3.0/swagger-ui-bundle.js",
            "https://unpkg.com/swagger-ui-dist@4.3.0/swagger-ui-standalone-preset.js",
        ],
        swaggerOptions: {
            url: "https://oc-3-sophie-bluel-back-end.vercel.app/swagger.json",
        },
    }
}

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
)
app.use("/images", express.static(path.join(__dirname, "images")))

const db = require("./models")
const userRoutes = require("./routes/user.routes")
const categoriesRoutes = require("./routes/categories.routes")
const worksRoutes = require("./routes/works.routes")
db.sequelize.sync().then(() => console.log("db is ready"))
app.use("/api/users", userRoutes)
app.use("/api/categories", categoriesRoutes)
app.use("/api/works", worksRoutes)

if (process.env.ENV !== "vercel") {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
} else {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(null, swaggerCustom))
}

module.exports = app
