const userModel = require("../models/userModel")
const productModel = require("../models/productModel")
const { uploadFile } = require("../utils/aws")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const { isValid, isValidbody, nameRegex, emailRegex, isValidPassword, objectid, phoneRegex } = require("../validator/validator")

//==============================================create api=============================================
const createProduct = async function (req, res) {
    try {
        let data = req.body
        if (!isValidbody(data)) {
            return res.status(400).send({ status: false, msg: "plz enter some keys and values in the data" })
        }

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage,style,availableSizes,installments,} = data

        const createdProduct = await productModel.create(data)

        return res.status(201).send({ status: true, data: createdProduct })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const getProductById = async function(req, res) {
    try {
        let productId = req.params.productId
        if(!productId)  return res.status(400).send({ status: false, msg: "ProductId is required" })
        if (!isValid(productId)) return res.status(400).send({ status: false, message: "Incorrect productId" })
        if (!productId.match(objectid)) return res.status(400).send({ status: false, message: "Incorrect productId" })

        let product = await productModel.findById(productId)
        if(!product || product.isDeleted == true)    return res.status(404).send({ status: false, msg: "Product not found" })

        return res.status(200).send({ status: true, data: product })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updateProduct = async function(req, res) {
    try {
        let productId = req.params.productId
        let data = req.body

        if(!productId)  return res.status(400).send({ status: false, msg: "ProductId is required" })
        if (!isValid(productId)) return res.status(400).send({ status: false, message: "Incorrect productId" })
        if (!productId.match(objectid)) return res.status(400).send({ status: false, message: "Incorrect productId" })

        let product = await productModel.findById(productId)
        if(!product || product.isDeleted == true)    return res.status(404).send({ status: false, msg: "Product not found" })

        if (!isValidbody(data) && !req.files) return res.status(400).send({ status: false, message: "Please provide data to update" })
        let {title, description, price, currencyId, currencyFormat, isFreeShipping,  style, availableSizes, installments} = data

        if(req.files) {
            let image = req.files[0]
            if(image) {
                let url = await uploadFile(image)
                data.productImage = url
            }
        }

        let updatedProduct = await productModel.findOneAndUpdate({ _id: productId }, data, { new: true })
        return res.status(200).send({ status: true, data: updatedProduct })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


module.exports = { createProduct, getProductById, updateProduct }

