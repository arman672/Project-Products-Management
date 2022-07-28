const userModel = require("../models/userModel")
const productModel = require("../models/productModel")
const { uploadFile } = require("../utils/aws")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const { isValid, isValidbody, nameRegex, emailRegex, isValidPassword, objectid, phoneRegex, alphaNumSpaceReg, priceReg, } = require("../validator/validator");
const { set } = require("mongoose");
const { json } = require("express");
const { find } = require("../models/userModel");

//==============================================create api=============================================
const createProduct = async function (req, res) {
    try {
        let data = req.body

        if (!isValidbody(data)) {
            return res.status(400).send({ status: false, msg: "plz enter some keys and values in the data" })
        }

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data

        //title validation
        if (title) {
            if (!isValid(title)) return res.status(400).send({ status: false, message: "title is in incorrect format" })
            let isUniqueTitle = await productModel.findOne({ title: title });
            if (isUniqueTitle) {
                return res.status(400).send({ status: false, message: "This title is being used already" })
            }
        } else return res.status(400).send({ status: false, message: "title must be present" })


        //description validation
        if (description) {
            if (!isValid(description)) return res.status(400).send({ status: false, message: "description is in incorrect format" })
        } else return res.status(400).send({ status: false, message: "description must be present" })

        //price validation
        console.log(price)
        if (!price) return res.status(400).send({ status: false, message: "price cannot be empty" })
        if (!price.toString().match(priceReg)) return res.status(400).send({ status: false, message: "price should be in valid number/decimal format" })

        //currencyID validation
        if (currencyId && currencyId.trim().length !== 0) {
            if (currencyId !== "INR") return res.status(400).send({ status: false, message: "only indian currencyId is allowed and the type should be string" })
        } else return res.status(400).send({ status: false, message: "currencyId cannot be empty" })

        //currency format validation
        if (currencyFormat && currencyFormat.trim().length !== 0) {
            if (currencyFormat !== "₹") return res.status(400).send({ status: false, message: "only indian currencyFormat is allowed and the type should be string" })
        } else return res.status(400).send({ status: false, message: "currencyFormat cannot be empty" })

        //isFreeShipping validation
        if (isFreeShipping) {
            if (isFreeShipping == "true" || isFreeShipping == "false" || typeof isFreeShipping === "boolean") { }
            else return res.status(400).send({ status: false, message: "type should be Boolean or true/false" })
        }

        //productImage validation
        if (req.files) {
            let image = req.files[0]
            if (image) {
                console.log(image)
                if (!(image.mimetype.startsWith("image"))) return res.status(400).send({ status: false, message: "only image files are allowed" })
                let url = await uploadFile(image)
                data.productImage = url
            } else return res.status(400).send({ status: false, message: "must include product image file" })
        }else return res.status(400).send({ status: false, message: "must include product image file" })

        //style validation
        if (style) {
            if (!isValid(style) || !style.match(nameRegex))
                return res.status(400).send({ status: false, message: "style is in incorrect format" })
        }

        //installments validation
        if (installments) {
            installments = parseInt(installments)
            if (!installments || typeof installments != "number")
                return res.status(400).send({ status: false, message: "installments should be of type number" })
        }

        //availableSizes validation
        if (availableSizes) {
            availableSizes = JSON.parse(availableSizes)//parsing to array
            if (Array.isArray(availableSizes)) {
                let enumArr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
                let uniqueSizes = [...new Set(availableSizes)]
                for (let ele of uniqueSizes) {
                    if (enumArr.indexOf(ele) == -1) {
                        return res.status(400).send({ status: false, message: `'${ele}' is not a valid size, only these sizes are allowed [S, XS, M, X, L, XXL, XL]` })
                    }
                }
                data.availableSizes = uniqueSizes
            } else return res.status(400).send({ status: false, message: "availableSizes should be of type Array" })
        } else return res.status(400).send({ status: false, message: "please provide atleast one size" })

        const createdProduct = await productModel.create(data)

        return res.status(201).send({ status: true, data: createdProduct })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const getProductByQuery = async function(req, res) {
    try {
        let query = req.query;  

        let {size, name, priceGreaterThan ,priceLessThan} = query

        let filter = {
            isDeleted: false
        }

        if (Object.keys(query).length == 0) {  
            const allProducts = await productModel.find({isDeleted: false }).select({_id:0,__v:0 })
            if (allProducts.length == 0) return res.status(404).send({ status: false, message: "no products found"});
            return res.status(200).send({ status: true, data: allProducts})
        }

        if(size){
            size = JSON.parse(size)
            if (Array.isArray(size)) {               
                let enumArr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
                let uniqueSizes = [...new Set(size)]
                for (let ele of uniqueSizes) {
                    if (enumArr.indexOf(ele) == -1) {
                        return res.status(400).send({ status: false, message: `'${ele}' is not a valid size, only these sizes are available [S, XS, M, X, L, XXL, XL]` })
                    }
                }
                filter["availableSizes"] = { $in: uniqueSizes };
            }else return res.status(400).send({ status: false, message: "size should be of type Array" })          
        }

        //to do substring name
        if(name){
            if (!isValid(name)) return res.status(400).send({ status: false, message: "name is in incorrect format" })
            filter["title"] = name;
        }

        if(priceGreaterThan){
            if (!priceGreaterThan.toString().match(priceReg)) return res.status(400).send({ status: false, message: "price should be in valid number/decimal format" })
            filter["price"] = { $gte: priceGreaterThan }
        }

        if(priceLessThan){
            if (!priceLessThan.toString().match(priceReg)) return res.status(400).send({ status: false, message: "price should be in valid number/decimal format" })
            filter["price"] = { $lte: priceLessThan }
        }
 
        if(priceGreaterThan && priceLessThan){
            if (!priceLessThan.toString().match(priceReg)) return res.status(400).send({ status: false, message: "price should be in valid number/decimal format" })
            if (!priceGreaterThan.toString().match(priceReg)) return res.status(400).send({ status: false, message: "price should be in valid number/decimal format" })
            filter["price"] = {$gte: priceGreaterThan, $lte: priceLessThan}
        }

        const foundProducts = await productModel.find(filter).select({_id:0,__v:0 })

        console.log("foundProducts")
        
        if(foundProducts.length == 0) return res.status(404).send({ status: true, message: "no product found for the given query"})

  
        

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

module.exports = { createProduct, getProductById, getProductByQuery}

