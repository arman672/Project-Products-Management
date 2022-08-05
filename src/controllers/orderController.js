const orderModel = require("../models/orderModel")
const userModel = require("../models/userModel")
const cartModel = require("../models/cartModel")

const { isValid, objectid } = require("../validator/validator");

const createOrder = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!userId) return res.status(400).send({ status: false, message: "userId is required" })
        if (!isValid(userId)) return res.status(400).send({ status: false, message: "Incorrect userId" })
        if (!userId.match(objectid)) return res.status(400).send({ status: false, message: "Incorrect userId" })
        
        let user = await userModel.findById(userId)
        if (!user) return res.status(404).send({ status: false, message: "user not found" })
        if (req.token.userId != userId) return res.status(403).send({ status: false, message: "Not Authorised" })

        let data = req.body

        let { cancellable, cartId } = data
        if (!cartId) {
            return res.status(400).send({ status: false, message: "please provide a cartId" })
        }

        if (!isValid(cartId)) return res.status(400).send({ status: false, message: "Incorrect cartId" })
        if (!cartId.match(objectid)) return res.status(400).send({ status: false, message: "Incorrect cartId" })

        const checkCart = await cartModel.findById(cartId)
        if (!checkCart) {
            return res.status(404).send({ status: false, message: "cart not found" })
        }

        //auth
        if (req.token.userId != checkCart.userId.toString()) return res.status(403).send({ status: false, message: "Not Authorised to update this order" })

        if (checkCart.items.length === 0) return res.status(400).send({ status: false, message: "Cart is empty cannot place an order!" })

        // const checkorder = await orderModel.findOne({ userId: userId, isDeleted: false, status: "pending" })
        // if (checkorder) {
        //     return res.status(400).send({ status: false, message: `order(${checkorder._id}) is pending for the given cart` })
        // }

        let orderData = checkCart.toObject()
        delete orderData["_id"]

        orderData["totalQuantity"] = 0

        let itemsArr = checkCart.items
        for (i = 0; i < itemsArr.length; i++) {
            orderData.totalQuantity += itemsArr[i].quantity
        }

        if (cancellable != undefined) {
            if (!(cancellable == "true" || cancellable == "false" || typeof cancellable === "boolean"))
                return res.status(400).send({ status: false, message: "cancellable should be Boolean or true/false" })
            orderData["cancellable"] = cancellable
        }

        checkCart.items = []
        checkCart.totalPrice = 0
        checkCart.totalItems = 0
        checkCart.save()

        const order = await orderModel.create(orderData)
        return res.status(201).send({ status: true, message: "Success", data: order })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updateOrder = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!userId) return res.status(400).send({ status: false, message: "userId is required" })
        if (!isValid(userId)) return res.status(400).send({ status: false, message: "Incorrect userId" })
        if (!userId.match(objectid)) return res.status(400).send({ status: false, message: "Incorrect userId" })

        let user = await userModel.findById(userId)
        if (!user) return res.status(404).send({ status: false, message: "user not found" })
        //auth
        if (req.token.userId != userId) return res.status(403).send({ status: false, message: "Not Authorised" })

        let data = req.body

        let { orderId, status } = data

        if (!orderId) {
            return res.status(400).send({ status: false, message: "please provide a orderId" })
        }
        if (!status) {
            return res.status(400).send({ status: false, message: "please provide status for the order" })
        }

        if (!isValid(orderId)) return res.status(400).send({ status: false, message: "Incorrect orderId" })
        if (!orderId.match(objectid)) return res.status(400).send({ status: false, message: "Incorrect orderId" })

        const foundOrder = await orderModel.findOne({ _id: orderId, isDeleted: false })
        if (!foundOrder) {
            return res.status(404).send({ status: false, message: "order not found for the given id" })
        }

        //auth
        if (req.token.userId != foundOrder.userId.toString()) return res.status(403).send({ status: false, message: "Not Authorised to update this order" })

        if (foundOrder.status == "completed") return res.status(400).send({ status: false, message: "the order status cannot be updated because it is alredy set to completed" })

        if (foundOrder.status == "cancelled") return res.status(400).send({ status: false, message: "the order status cannot be updated because it is alredy set to cancelled" })

        if (status === "cancelled") {
            if (foundOrder.cancellable == false) return res.status(400).send({ status: false, message: "this order cannot be cancelled" })
            else foundOrder.status = "cancelled"
        } else if (status === "completed") {
            foundOrder.status = "completed"
        } else {
            return res.status(400).send({ status: false, message: "the status could either be cancelled or completed!" })
        }

        foundOrder.save()
        return res.status(200).send({ status: true, message: "Success", data: foundOrder })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
module.exports = { createOrder, updateOrder }























