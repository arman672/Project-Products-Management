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

module.exports = { createProduct }

