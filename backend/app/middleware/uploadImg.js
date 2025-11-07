const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Filter to accept only images
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Please upload only images."), false);
    }
};

// Set your live image upload path
const imagePath = path.join(__dirname, "../../../socialvibe.tradestreet.in/uploads");

// Create the directory if it does not exist
if (!fs.existsSync(imagePath)) {
    fs.mkdirSync(imagePath, { recursive: true });
}

// Set up multer to save the image
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imagePath); // Saving images to the uploads directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname); // Unique filename
    },
});

// Multer middleware to handle image uploads
const uploadImg = multer({
    storage: storage,
    fileFilter: imageFilter, // Only allow image files
}).single("image_file"); // Use the field name from your frontend

module.exports = uploadImg;
