const  Course = require("../models/Course");
const Tag = require("../models/tags");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

//createCourse handler function
exports.createCourse = async(req,res) => {
    try{
       //
       const {courseName,courseDescription,whatWillYouLearn,price,tag} = req.body;

       //get thumbnail
       const thumbnail = req.files.thumbnailImage;

       //validation
       
       if(!courseName || !courseDescription || !whatWillYouLearn || !price || !tag || !thumbnail){
        return res.status(400).json({
            success:false,
            message:"All fields are required",
        })
       }
       //check for instructor 
       const userId = req.user.id;
       const instructorDetails = await User.findById(userId);
       console.log("Instructor Details",instructorDetails);
       //TODO:VERIFY THAT USERID AND INSTRUCTORDETAILS._ID ARE SAME OR NOT?

       if(!instructorDetails){
          return res.status(404).json({
            success:true,
            message:"Instructor details not found",
          })
       }
      //check given tag is valid or not
      const tagDetails = await Tag.findById(tag);
      if(!tagDetails){
        return res.status(404).json({
            success:true,
            message:"Tag details not found",
          })
      }
      //upload image to cloudinary
      const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

      //create entry for new Course
      const newCourse = await Course.create({
        courseName,
        courseDescription,
        instructor: instructorDetails._id,
        whatYouWillLearn:whatWillYouLearn,
        price,
        tag: tagDetails._id,
        thumbnail:thumbnailImage.secure_url,
      })

      //addd teh new course too the user schema of instructor 
      await User.findByIdAndUpdate(
        {_id:instructorDetails._id},
        {
            $push:{
                courses:newCourse._id,
            }
        },
        {new:true},
      );

      //update tag schema


      //return response
      return res.status(200).json({
        success:true,
        message:"Course created Successfully",
        data:newCourse,
      });

    }
    catch(error){
        console.error(error);
     return res.status(500).json({
      success:false,
      message:"Failed to create Course",
      error:error.message,
     })
    }
};


//getAllCourses handler function
exports.showAllCourses = async(req,res)=>{
    try{
       const allCourses = await Course.find({},{courseName:true,
                                                price:true,
                                                thumbNail:true,
                                                instructor:true,
                                                ratingAndReviews:true,
                                                studentsEnrolled:true,})
                                                .populate("insctuctor")
                                                .exec();
        return res.status(200).json({
            success:true,
            message:"Data for all courses fetched successfully",
            data:allCourses,
        })
    } 
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Cannot fetch course data",
            error:error.message,
        })
    }
}

