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



        let { productId,quantity,cartId } = data
        data.userId = userId
        if(!productId){
            return res.status(400).send({ status: false, msg: "please provide productId" })

        }
        if(!quantity){
            return res.status(400).send({ status: false, msg: "please provide quantity" })

        }

        if(cartId){
            let cart=await cartModel.findById({cartId})
            if(userId!=cart.userId){
                return res.status(403).send({ status: false, msg: "not authorized" })

            }
            let product=await productModel.findById({productId})
                if(!product||product.isDeleted==true){
                    return res.status(403).send({ status: false, msg: "not authorized " })

                    
                }
            
        }

        




        //  (!items) {
        //     return res.status(400).send({ status: false, msg: "please enter the items" })

        // }
        // else {
        //     if (Array.isArray(items)) {
                // for (let i = 0; i < items.length; i++) {
                //     if (items[i].productId) {
                //         const foundItems = await cartModel.findOne({ productId: items[i].productId })
                //         if (!foundItems) {
                //             return res.status(400).send({ status: false, msg: "product id does not exist" })
                //         }
                //     }
                //     else {
                //         return res.status(400).send({ status: false, msg: "productId must be present" })
                //     }
                // }
            // }
            // else {
            //     return res.status(400).send({ status: false, msg: "items must be in array form " })
            // }
        // }





    


        let createCart = await cartModel.create(data)
        return res.status(201).send({ status: true, msg: "cart created successfully", data: createCart })


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
        let cart = await cartModel.findOne({userId})
        return res.status(200).send({ status: true, msg: "Successfully created cart", data: cart })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })


    }
}



module.exports = { createCart, getCart }
