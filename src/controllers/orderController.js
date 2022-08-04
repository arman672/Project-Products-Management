const orderModel=require("../models/orderModel")
const userModel = require("../models/userModel")
const cartModel = require("../models/cartModel")

const { isValid, isValidbody,  objectid } = require("../validator/validator");




const createOrder = async function (req, res) {
    try {
        let userId = req.params.userId


        if (!userId) return res.status(400).send({ status: false, msg: "userId is required" })
        if (!isValid(userId)) return res.status(400).send({ status: false, message: "Incorrect userId" })
        if (!userId.match(objectid)) return res.status(400).send({ status: false, message: "Incorrect userId" })
        let user = await userModel.findById(userId)
        if (!user) return res.status(404).send({ status: false, msg: "user not found" })
        if (req.token.userId != userId) return res.status(403).send({ status: false, message: "Not Authorised" })

        let data = req.body
        

        let { cancellable, cartId } = data
        if (!cartId) {
            return res.status(400).send({ status: false, message: "please provide a cartId" })
        }


        if (!isValid(cartId)) return res.status(400).send({ status: false, message: "Incorrect cartId" })
        if (!cartId.match(objectid)) return res.status(400).send({ status: false, message: "Incorrect cartId" })


        const checkCart = await cartModel.findOne({ userId })
        if (!checkCart) {
            return res.status(404).send({ status: false, message:"cart not found" })
        }


        
        
        const checkorder = await orderModel.findOne({ userId })
        if (checkorder) {
            return res.status(400).send({ status: false, message: `order is already exist: cartId ` })
        }

        let orderData=checkCart.toObject()
        orderData["totalQuantity"]=0
        console.log(orderData,checkCart);

        if (cancellable) {
            if (!(cancellable == "true" || cancellable == "false" || typeof cancellable === "boolean"))
                return res.status(400).send({ status: false, message: "isDeleted should be Boolean or true/false" })

                orderData["cancellable"]=cancellable

        }





        const order = await orderModel.create(orderData)
        return res.status(200).send({ status: true, message: "Success", data: order })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}
module.exports = { createOrder }























