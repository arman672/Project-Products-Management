const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")

const productController = require("../controllers/productController")
const cartController = require("../controllers/cartController")
const orderController=require("../controllers/orderController")
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
router.delete("/products/:productId", productController.deleteProductsById)

//**********************************CARTAPI****************************************** */
router.post("/users/:userId/cart",mw.authentication, cartController.createCart)
router.get("/users/:userId/cart",mw.authentication, cartController.getCart)
router.put("/users/:userId/cart", mw.authentication, cartController.updateCart)
router.delete("/users/:userId/cart", mw.authentication, cartController.deleteCart)

//***********************************ORDERAPI**************************************** */
router.post("/users/:userId/orders",mw.authentication,orderController.createOrder)
router.put("/users/:userId/orders",mw.authentication,orderController.updateOrder)

router.all("/*", function(req, res) {
    res.status(404).send({ msg: "No such Api found" })
})
module.exports = router