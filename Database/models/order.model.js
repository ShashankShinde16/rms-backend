import { Schema,model } from "mongoose";


const orderSchema = new Schema({
    userId:{
        type:Schema.ObjectId,
        required:true,
        ref:'user'
    },
    cartItems:[
        {
            productId:{type:Schema.ObjectId, ref : "product"},
            variationId: Schema.ObjectId,
            quantity:{
              type:Number,
              default:1
            },
            price:Number,
            totalProductDiscount:Number
          }
    ],
    shippingAddress:{
        street:String,
        city:String,
        phone:Number
    },
    paymentMethod:{
        type:String,
        enum:['card','cash', 'razorpay'],
        default:'cash'
    },
    isPaid:{
        type:Boolean,
        default:false
    },
    isDelivered:{
        type:Boolean,
        default:false
    },
    status: {
        type: String,
        enum: ['pending', 'delivered', 'cancelled'],
        default: 'pending'
      },
    paidAt:Date,
    deliveredAt:Date
})

export const orderModel = model('order',orderSchema)