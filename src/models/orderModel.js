const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

//.............Order Schema.........

const orderSchema = new mongoose.Schema({
userId:{
    type: ObjectId,
    required: true
},

items:[{
    productId: {
       type:  ObjectId,
        required: true
    },
    quantity: {
        type: Number,
        required: true
        // Minimum 1
    }
    }],

    totalPrice: {
        type: Number,
        required: true
        // comment: "Holds total price of all the items in the cart"
    },
    totalItems: {
     type: Number,
     required: true
     //comment: "Holds total number of items in the cart"

    },
    totalQuantity: {
        type: Number,
        required: true
        // comment: "Holds total number of quantity in the cart"
    },
    cancellable: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        default: 'pending',
        enum: ["pending","completed", "cancelled"]
    },

    deletedAt: {
        type: Date
        //when the document is deleted
    },
    isDeleted: {
        type: Boolean,
        default: false
    }

}, {timestamps: true})

module.exports = mongoose.model('Order', orderSchema);