const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")

router.post("/register", userController.register)
router.put("/user/:userId/profile", userController.updateUser)

module.exports = router