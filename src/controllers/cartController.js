const cartModel=require("../models/cartModel")
const userModel=require("../models/userModel")
const productModel=require("../models/productModel")
const { isValid, isValidbody, nameRegex, objectid,priceReg } = require("../validator/validator");

const createCart = async function(req,res){
try{
    let userId=req.params.userId
    let data=req.body
    

    let{items,totalPrice,totalItems}=data
    data.userId=userId

    let createCart=await cartModel.create(data)
    return res.status(201).send({status:true,msg:"successfully created a cart",data:createCart})

}
catch (err) {
    return res.status(500).send({ status: false, message: err.message })
}
}

//=======================================
//Updates a cart by either decrementing the quantity of a product by 1 or deleting a product from the cart.
const updateCart = async function(req,res){
    try {
        //Get cart id in request body.
        //Get productId in request body.
        //Get key 'removeProduct' in request body.
        const userId = req.params.userId
        const data = req.body
        let{cartId, productId, removeProduct} = data

        //validations
        if (!isValidbody(data)) {
            return res.status(400).send({ status: false, msg: "plz enter some keys and values in the data" })
        }

        if(!userId){
            return res.status(404).send({ status: false, message: "Product not found for the given productId" })
        }
        

        //cart validations-
        //Make sure that cart exist-
        const foundCart = await cartModel.findById(cartId).populate([{path : "items.productId"}])//since productid is inside an ARRAY of OBJECT
        
        if(!foundCart) return res.status(404).send({ status: false, message: "cart not found for the given cartId" })

        //authorization
        let loggedInUser = req.token.userId
        if(loggedInUser !== userId) return res.status(403).send({ status: false, message: "not authorized"})
        if(loggedInUser !== foundCart.userId.toString()) return res.status(403).send({ status: false, message: "not authorized to update this cart"})

        //Make sure the user exist-
        const foundUser = await userModel.findById(userId)
        if(!foundUser) return res.status(404).send({ status: false, message: "user not found for the given userId" })
        
        //Check if the productId exists and is not deleted before updating the cart
        let foundProduct = await productModel.findOne({_id: productId, isDeleted: false})
        if(!foundProduct) return res.status(404).send({ status: false, message: "Product not found for the given productId" })



        //removeProduct and update
        let itemsArr = foundCart.items 
        let initialItems = itemsArr.length
        let totalPrice = foundCart.totalPrice
        let totalItems = foundCart.totalItems
            
        if(itemsArr.length === 0) return res.status(404).send({ status: false, msg: "cart is empty nothing to delete"})

        if(removeProduct === 0){
            for(let i = 0; i<itemsArr.length; i++){
                if(productId == itemsArr[i].productId._id){
                    totalPrice -= itemsArr[i].productId.price * itemsArr[i].quantity
                    totalItems -= itemsArr[i].quantity
                    itemsArr.splice(i,1)
                }
            }
            if(initialItems === itemsArr.length) return res.status(404).send({ status: false, msg: "product does not exist in the cart"})
        }
   
        if(removeProduct === 1){
            initialItems = totalItems
            for(let i = 0; i<itemsArr.length; i++){
                if(productId == itemsArr[i].productId._id){  
                    totalPrice -= itemsArr[i].productId.price
                    totalItems--
                    itemsArr[i].quantity--
                    if(itemsArr[i].quantity == 0) {
                        itemsArr.splice(i,1)
                    }
                }
            }
            if(initialItems === totalItems) return res.status(404).send({ status: false, msg: "product does not exist in the cart"})
        }

        const updatedCart = await cartModel.findOneAndUpdate({_id: cartId}, ({items : itemsArr, totalPrice: totalPrice, totalItems: totalItems}), {new: true}).select({__v: 0})   

        if(!updatedCart) return res.status(404).send({ status: false, msg: "cart not found" })

        return res.status(200).send({ status: true, message:"Success", data: updatedCart})
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
module.exports={createCart, updateCart}
