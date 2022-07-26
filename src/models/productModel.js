const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true, 
        unique: true
    },
    description: {
        type: String, 
        required: true
    },
    price: {
        type: Number, 
        required: true //valid number/decimal
    },
    currencyId: {
        type: String, 
        required: true //INR
    },
    currencyFormat: {
        type:String, 
        required: true //Rupee symbol
    },
    isFreeShipping: {
        type: Boolean,
        default: false
    },
    productImage: {
        type: String, 
        required:true // s3 link
    },  
    style: {
        type: String
    },
    availableSizes: {
        type: [String],
        enum:["S", "XS","M","X", "L","XXL", "XL"] //at least one size,
    },
    installments: {
        type: Number
    },
    deletedAt: {
        type: Date //when the document is deleted //default: null
    }, 
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model('Product', productSchema)