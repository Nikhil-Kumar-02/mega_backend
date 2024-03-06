const { StatusCodes } = require('http-status-codes');
const Cart = require("../model/cart");
const Course = require("../model/courses");

const addToCart = async (req , res) => {
    try {
        const {courseId} = req.body;
        const userId = req.user.id;

        //check if it is a valid course  if yes add to users cart items and return result
        const courseFound = await Course.findById(courseId);

        if(!courseFound){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message : 'Course does not Exists',
                description : 'please send the correct course id',
            })
        }

        const userCurrentCart = await Cart.findOne({userId});
        if(userCurrentCart.cartItems.includes(courseId)){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message : 'course Aleady in cart',
                description : 'course is already added to cart',
            })
        }

        const newCart = await Cart.findOneAndUpdate({userId} , {
            $push : {
                cartItems : courseId,
            }
        } , {new : true});

        console.log('the updated cart is ' , newCart);

        return res.status(StatusCodes.OK).json({
            message : 'course added to cart',
            newCart,
            courseFound
        })
    } catch (error) {
        console.log('error while adding item to cart : ' , error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'Item not Added',
            description : 'error while adding item to cart',
        })
    }
}


const removeFromCart = async (req , res) => {
    try {
        const {courseId} = req.body;
        const userId = req.user.id;

        //check if it is a valid course  if yes add to users cart items and return result
        const courseFound = await Course.findById(courseId);

        if(!courseFound){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message : 'Course does not Exists',
                description : 'please send the correct course id',
            })
        }

        const newCart = await Cart.findOneAndUpdate({userId} , {
            $pull : {
                cartItems : courseId,
            }
        } , {new : true});

        return res.status(StatusCodes.OK).json({
            message : 'course removed from cart',
            newCart,
            courseFound,
        })
    } catch (error) {
        console.log('error while removind item from cart : ' , error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'Item not removed',
            description : 'error while removing item from cart',
        })
    }
}

module.exports = {
    addToCart,
    removeFromCart,
}