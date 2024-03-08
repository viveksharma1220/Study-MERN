const  SubSection = require("../models/SubSection")
const Section = require("../models/Section");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

//create subSection logic
exports.createSubSection = async(req,res) =>{
    try{
       //fetch data from req body
       const {sectionId,title,timeDuration,description} = req.body;
       //extract file/video
       const video = req.files.videoFile;
       //validation
       if(!sectionId || !title || !timeDuration || !description || !video){
          return res.status(400).json({
            success:false,
            message:"All fields are required",
          });
       }
       //upload video to cloudinary
       const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
       //create a subSection
       const subSectionDetails = await SubSection.create({
        title:title,
        timeDuration:timeDuration,
        description:description,
        videoUrl:uploadDetails.secure_url,
       })
       //update section with this subsection ObjectId
       const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
                                                                {$push:{
                                                                    subSection:subSectionDetails._id
                                                                }} ,                          
                                                            {new:true});
                                                            //HW:-Log updated section here after adding populate query

       //return response
       return res.status(200).json({
        success:true,
        message:"Sub Section created Successfully",
        updatedSection,
       })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal Server error",
            error:error.message,
        })
    }
};


// hw: UPDATE SUBSECTION
// hw: DELETE SUBSECTION
 
