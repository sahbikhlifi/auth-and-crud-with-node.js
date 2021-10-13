const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

require("dotenv").config()
require("./config/connect.db")
require("./strategies/JwtStrategy")
require("./authenticate")

const app = express();
const userRouter = require("./routes/userRoutes")

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// routes
app.use("/users", userRouter)

// set port, listen for requests
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});