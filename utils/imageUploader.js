const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

const cloudinaryFileUpload = async (file , folder , height , quality) => {
    const options = {folder};
    if(height){
        options.height = height;
    }
    if(quality){
        options.quality = quality;
    }
    options.resource_type = "auto";

    return await cloudinary.uploader.upload(file.tempFilePath , options);
}

module.exports = cloudinaryFileUpload;