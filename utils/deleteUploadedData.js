const cloudinary = require('cloudinary').v2;

const deleteFromCloudinary = async (assetType , assetUrl) => {
    try {
        //now extract the file name from the url 
        const assetName = assetUrl.split('/');
        const assetNameLength = assetName.length;
        const assetNameWithoutExtension = assetName[assetNameLength - 1].split('.')[0];
        const assetCompletePath = `${assetName[assetNameLength-2]}/${assetNameWithoutExtension}`
        console.log('the path formed is : ' , assetCompletePath);
        
        const result = await cloudinary.uploader.destroy(assetCompletePath , {resource_type : assetType});
        console.log('sucessfully deleted from cloudinary');
        console.log('After Cloudinary Deletion', result);

        return result;

    } catch (error) {
        console.log('error while deleting the data from cloudinary' , error.message);
        throw error;
    }
}

module.exports = {deleteFromCloudinary};