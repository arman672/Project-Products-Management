const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const productController = require("../controllers/productController")
const mw = require("../middlewares/auth")

//============================User Apis=============================================
router.post("/register", userController.register)
router.post("/login", userController.loginUser)
router.get("/user/:userId/profile",mw.authentication, userController.getUser)
router.put("/user/:userId/profile",mw.authentication, userController.updateUser)

//=============================Product APIs==========================================
router.post("/products", productController.createProduct)
router.get("/products/:productId", productController.getProductById)
router.get("/products", productController.getProductByQuery)
router.put("/products/:productId", productController.updateProduct)
//router.delete("/products/:productId", productController.deleteProduct)


router.all("/*", function(req, res) {
    res.status(404).send({ msg: "No such Api found" })
})
module.exports = router