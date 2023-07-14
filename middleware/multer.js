const multer=require('multer');
const path =require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, "../public/productImages"))
  },
  filename: (req, file, cb) => {
      const name = `${Date.now()}-${file.originalname}`
      cb(null, name)
  }
})
const upload = multer({ storage: storage })

const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, "../public/categoryImages"))
  },
  filename: (req, file, cb) => {
      const name = `${Date.now()}-${file.originalname}`
      cb(null, name)
  }
})
const categoryUpload = multer({ storage: categoryStorage })
  
module.exports={
    upload,
    storage,
    categoryUpload

}