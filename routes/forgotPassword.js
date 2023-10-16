const express = require("express");
const forgotPasswordModel = require("../models/forgotPasswordModel");
router = express.Router()
nodemailer = require("nodemailer")
var User = require("../models/users")
const bcrypt = require("bcrypt")
// console.log(process.env.GMAIL_USER)

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    port: 465,               // true for 465, false for other ports
    host: "smtp.gmail.com",
       auth: {
            user: 'weberlabs.info@gmail.com',
            pass: 'ruviuaaeruluifza',
         },
    secure: true,
    }); 
// Function for random number 
function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

router.post("/generate-otp", async (req, res) => {
    const {to} = req.body
    // console.log(to, subject, text) 
    subject = "Otp for password change"
    randomNumber = randomRange(1000, 10000)
    const mailData = {
        from: process.env.GMAIL_USER,  // sender address
          to: to,   // list of receivers
          subject: subject,
          text: `${randomNumber}`,
          html: `<b>Hey there! </b>Your OTP for password change is <br> ${randomNumber}}<br/>`,
        };
        const UserModel = await User.findOne({email:to})
        // console.log("UserModelCheck",UserModel)
        // console.log("UserModelCheck2",UserModel.id)
      
        
        // // console.log(randomNumber)
        var forgotPasswordModelToSave = new forgotPasswordModel(
           {
             otp:randomNumber,
             user_email:UserModel.email
           }
        )
        await forgotPasswordModelToSave.save()
        
        // test line  
        // test_model = await forgotPasswordModel.find({user_id:UserModel.id})
        // console.log(test_model)
    transporter.sendMail(mailData, (error, info) => {
        if(error){
            return console.log(error)
        }
        else{
            res.status(200).send({message:"Mail send", "message_id":info.messageId})
        }
    })
    
})

router.post("/otp-verify", async function(req, res){
    const {user_email, otp} = req.body
    userModel = await User.findOne({email:user_email})
    forgotPasswordModelFetch = await forgotPasswordModel.findOne({user_email:userModel.email})
    // console.log(forgotPasswordModelFetch.otp)
    // Will return 200 if otp matches else will return 20 
    if(otp == forgotPasswordModelFetch.otp){
        obj = {
            "verify_response":200
        }
        forgotPasswordModelFetch.deleteOne()
        return res.json(obj)
    }

    else{
        obj = {
            "verify_response":20
        }
        forgotPasswordModelFetch.deleteOne()
        return res.json(obj)
    }
})

router.post("/reset-password", async function(req, res){
    const {user_email, new_password} = req.body 
    const hashed_password = bcrypt.hashSync(new_password, 10)
    UserForChange = await User.findOne({email:user_email}) 
    UserForChange.password = hashed_password
    await UserForChange.save()

    res.json({"reset-password-response":"Password Changed Successfully!"})
})

module.exports = router