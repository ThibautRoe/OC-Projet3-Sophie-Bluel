const express = require("express")
const path = require("path")
const { readFileSync } = require("fs")
const cors = require("cors")
require("dotenv").config()
const helmet = require("helmet")
const swaggerUi = require("swagger-ui-express")

const dirPath = __dirname

const swaggerPath = path.join(dirPath, "./swagger.json")
const swaggerDocument = JSON.parse(readFileSync(swaggerPath))

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
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

module.exports = app
