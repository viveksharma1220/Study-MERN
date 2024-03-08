const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken"); 
require("dotenv").config();


//send otp function
exports.sendOTP = async (req, res) => {
  try {
    //fetch email from req ki  body
    const { email } = req.body;

    //check if user already exists
    const checkUserPresent = await User.findOne({ email });

    //if user already exists,then return a response
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already registeresd",
      });
    }

    //generate OTP
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP Generated: ", otp);

    //check unique otp or not
    let result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };

    //create an entry in db for otp
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    //return response successful
    res.status(200).json({
      success: true,
      message: "OTP Sent sucessfully",
      otp,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//signup
exports.signUp = async (req, res) => {
  try {
    // data fetch from req ki body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;
    //validate krlo
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }
    // dono password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and confirmPassword value does not match,Please try again",
      });
    }
    //check user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User is already registered",
      });
    }
    //find most recent otp stored for the user
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOtp);
    //validate OTP
    if (recentOtp.length == 0) {
      // means OTP not found
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    } else if (otp !== recentOtp.otp) {
      //means Invalid otp
      return res.status(400).json({
        success: false,
        message: "Invalid otp",
      });
    }
    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    //entry create krdi db  ke andar

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    //return res
    res.status(200).json({
      success: true,
      message: "User is registered successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered,Please try again",
    });
  }
};

//login
 exports.login = async(req,res)=>{
       try{
         // get data from req ki body
           const {email,password}=req.body;
         //validation data
            if(!email || !password){
              return res.status(403).json({
                success:false,
                message:"All fields are required,Please try again",
              })
            }
         //user check if exists
          const user = await User.findOne({email}).populate("additionalDetails");
           if(!user){
            return res.status(401).json({
              success:false,
              message:"User is not registered,Please signup first",
            });
           }
         //generate jwt after matching password
             //match password first
             if(await bcrypt.compare(password,user.password)){
              const payload={
                 email:user.email,
                 id:user._id,
                 accountType:user.accountType,
              }
              //then create a token
                 const token=jwt.sign(payload,process.env.JWT_SECRET,{
                  expiresIn:"2h",
                 });
                 user.token=token;
                 user.password=undefined;

              //create cookie and send response 
              const options={
                expires:new Date(Date.now()+3*34*60*60*1000),
                httpOnly:true,  
              }
              res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in successfully",
              })

             }
             else{
              return res.status(401).json({
                success:false,
                message:"Password is incorrect",
              })
             }
       }
       catch(error){
         console.log(error);
         return res.status(500).json({
          suiccess:false,
          message:"Login failure,Please ttry again",
         }); 
       }
 }
//change password
exports.changePassword = async(req,res)=>{
  // get dats from req body
     
  //get oldPasssword , newPassword , confirmNewPassword

  //validation

  //update the password in databse

  //send mail - Password updated

  //return response
}
