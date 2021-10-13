const express = require("express")
const router = express.Router()

// Load controllers
const { signupController, loginController, refreshToken, activeAccount } = require('../controllers/userControllers')

// Routes
router.post("/signup", signupController)
router.get("/active/:activeToken", activeAccount)
router.post("/login",loginController)
router.post("/refreshToken", refreshToken)

module.exports = router