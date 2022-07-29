const mongoose = require("mongoose");
const objectId = mongoose.Schema.Types.ObjectId;

const cartSchema = new mongoose.Schema({
    userId: {
        type: objectId,
        ref : "User",
        required: true,
        unique: true
    },
    items: [{

        productId: {
            type: objectId,
            required: true,
            ref : "Product"
        },
        quantity: {
            type: Number,
            required: true,
            //min 1 
        }

    }],

    totalPrice: {
        type: Number,
        required: true,
        //price of all items in cart
    },
    totalItems: {
        type: Number,
        required: true,
        //number of items in cart 
    }
},  {timestamps : true })

module.exports = mongoose.model('Cart', cartSchema);
