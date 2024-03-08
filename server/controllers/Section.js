const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async(req,res)=>{
    try{
     //data fetch from req body
     const {sectionName ,courseId} = req.body;
     //data validation
     if(!sectionName || !courseId){
        return res.status(400).json({
            success:false,
            message:"Missing properties",
        });
     }
     //create section 
     const newSection = await Section.create({sectionName}); 
     //update course with section objectId
     const updatedCourseDetails = await Course.findByIdAndUpdate(
                               courseId,
                               {
                                $push:{
                                    courseContent:newSection._id,
                                }
                               },
                               {new:true}
                            )
    //HW:USE POPULATE TO REPLACE SECTIONS SUBSECTIONS BOTH IN THE UPDATES COURSE DETAILS
     //return response 
     return res.status(200).json({
        success:true,
        message:"Section created successfully",
        updatedCourseDetails,
     })
    }
    catch(error){
      return res.status(500).json({
        success:false,
        message:"Unable to create section,please try again",
        error:error.message,
      })
    } 
}


exports.updateSection = async(req,res) => {
    try{
      //data input 
      const {sectionName,sectionId} = req.body;
      //data validation   
      if(!sectionName || !sectionId) {
        return res.status(400).json({
          success:false,
          message:"Missing Properties",
        })
      }
      //update data
      const section = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true}); 
      //return res
      return res.status(200).json({
        success:true,
        message:"Section updated successfully",
      })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to create section,please try again",
            error:error.message,
          })
    }
}

exports.deleteSection = async(req,res) =>{
  try{
      //getId - assuming that we are sending id in params
      const {sectionId} = req.params;

      //use findByIdAndDelete
      await Section.findByIdAndDelete(sectionId);
      //TODO:Do we need to delete the entry from course schema->do while testing
      //return response 

      return res.status(200).json({
          success:true,
          message:"Section Deleted Successfully",
      })
  }
  catch(error){
    return res.status(500).json({
      success:false,
      message:"Unable to create section,please try again",
      error:error.message,
    })
  }
}