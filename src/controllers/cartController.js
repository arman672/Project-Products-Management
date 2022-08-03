const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const { isValid, isValidbody, nameRegex, objectid, priceReg } = require("../validator/validator");

const createCart = async function (req, res) {
    try {
        let userId = req.params.userId
        let data = req.body
        
        if (!isValidbody(data)) {
            return res.status(400).send({ status: false, msg: "please provide some in the cart body" })
        }



        let { productId, quantity, cartId } = data
        data.userId = userId
        if (!productId) {
            return res.status(400).send({ status: false, msg: "please provide productId" })

        }
        if (!quantity) {
            return res.status(400).send({ status: false, msg: "please provide quantity" })

        }
        let product = await productModel.findById({ _id:productId })
        
        if (!product || product.isDeleted == true) {
            return res.status(400).send({ status: false, msg: "product not found" })
        }
        if (cartId) {
            const cart = await cartModel.findById(cartId).populate([{ path: "items.productId" }])
            if (userId != cart.userId) {
                return res.status(403).send({ status: false, msg: "not authorized" })


            }
            let itemsArr = cart.items
            console.log(itemsArr);
            let initialItems = itemsArr.length
            let totalPrice = cart.totalPrice
            let totalItems = cart.totalItems
            let flag = true


           
            for (i = 0; i < itemsArr.length; i++) {
                if (itemsArr[i].productId._id == productId) {
                    itemsArr[i].quantity += quantity
                    totalPrice += itemsArr[i].productId.price * quantity
                    totalItems += quantity
                    flag=false
                }
                

            }
            if(flag==true){
                itemsArr.push({productId:productId,quantity:quantity})
                totalPrice +=product.price * quantity
                totalItems += quantity
            }

            const updatedCart = await cartModel.findOneAndUpdate({ _id: cartId }, ({ items: itemsArr, totalPrice: totalPrice, totalItems: totalItems }), { new: true }).select({ __v: 0 })

        if (!updatedCart) return res.status(404).send({ status: false, msg: "cart not found" })

        return res.status(200).send({ status: true, message: "Success", data: updatedCart })
            
        }
        else{
            let data={
                userId:userId,
                items:[{
                    productId:productId,
                    quantity:quantity
                }],
                totalPrice:product.price*quantity,
                totalItems:quantity
            }
            const checkCart=await cartModel.findOne({userId})
            if(checkCart){
                return res.status(400).send({ status: false, message:` cart is already exist ${checkCart._id}`})

            }
            const cart=await cartModel.create(data)
            return res.status(200).send({ status: true, message: "Success", data: cart })

            
        }


    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}


const getCart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!userId) {
            return res.status(400).send({ status: false, msg: "plz enter the userId" })
        }
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, msg: "incorrect userId userId" })
        }
        if (!userId.match(objectid)) {
            return res.status(400).send({ status: false, msg: "incorrect userId" })
        }
        let cart = await cartModel.findOne({ userId })
        return res.status(200).send({ status: true, msg: "Successfully created cart", data: cart })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })


    }
}





//=======================================
//Updates a cart by either decrementing the quantity of a product by 1 or deleting a product from the cart.
const updateCart = async function (req, res) {
    try {
        //Get cart id in request body.
        //Get productId in request body.
        //Get key 'removeProduct' in request body.
        const userId = req.params.userId
        const data = req.body
        let { cartId, productId, removeProduct } = data

        //validations
        if (!isValidbody(data)) {
            return res.status(400).send({ status: false, msg: "plz enter some keys and values in the data" })
        }

        if (!userId) {
            return res.status(404).send({ status: false, message: "Product not found for the given productId" })
        }


        //cart validations-
        //Make sure that cart exist-
        const foundCart = await cartModel.findById(cartId).populate([{ path: "items.productId" }])//since productid is inside an ARRAY of OBJECT

        if (!foundCart) return res.status(404).send({ status: false, message: "cart not found for the given cartId" })

        //authorization
        let loggedInUser = req.token.userId
        if (loggedInUser !== userId) return res.status(403).send({ status: false, message: "not authorized" })
        if (loggedInUser !== foundCart.userId.toString()) return res.status(403).send({ status: false, message: "not authorized to update this cart" })

        //Make sure the user exist-
        const foundUser = await userModel.findById(userId)
        if (!foundUser) return res.status(404).send({ status: false, message: "user not found for the given userId" })

        //Check if the productId exists and is not deleted before updating the cart
        let foundProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!foundProduct) return res.status(404).send({ status: false, message: "Product not found for the given productId" })



        //removeProduct and update
        let itemsArr = foundCart.items
        let initialItems = itemsArr.length
        let totalPrice = foundCart.totalPrice
        let totalItems = foundCart.totalItems

        if (itemsArr.length === 0) return res.status(404).send({ status: false, msg: "cart is empty nothing to delete" })

        if (removeProduct === 0) {
            for (let i = 0; i < itemsArr.length; i++) {
                if (productId == itemsArr[i].productId._id) {
                    totalPrice -= itemsArr[i].productId.price * itemsArr[i].quantity
                    totalItems -= itemsArr[i].quantity
                    itemsArr.splice(i, 1)
                }
            }
            if (initialItems === itemsArr.length) return res.status(404).send({ status: false, msg: "product does not exist in the cart" })
        }

        if (removeProduct === 1) {
            initialItems = totalItems
            for (let i = 0; i < itemsArr.length; i++) {
                if (productId == itemsArr[i].productId._id) {
                    totalPrice -= itemsArr[i].productId.price
                    totalItems--
                    itemsArr[i].quantity--
                    if (itemsArr[i].quantity == 0) {
                        itemsArr.splice(i, 1)
                    }
                }
            }
            if (initialItems === totalItems) return res.status(404).send({ status: false, msg: "product does not exist in the cart" })
        }

        const updatedCart = await cartModel.findOneAndUpdate({ _id: cartId }, ({ items: itemsArr, totalPrice: totalPrice, totalItems: totalItems }), { new: true }).select({ __v: 0 })

        if (!updatedCart) return res.status(404).send({ status: false, msg: "cart not found" })

        return res.status(200).send({ status: true, message: "Success", data: updatedCart })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
module.exports = { createCart, updateCart, getCart }
