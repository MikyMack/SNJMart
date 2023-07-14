const multer=require('multer');
const path =require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, "../public/upload"))
  },
  filename: (req, file, cb) => {
      const name = `${Date.now()}-${file.originalname}`
      cb(null, name)
  }
})
const uploads = multer({ storage: storage })

const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, "../public/uploads"))
  },
  filename: (req, file, cb) => {
      const name = `${Date.now()}-${file.originalname}`
      cb(null, name)
  }
})
const categoryUpload = multer({ storage: categoryStorage })
  
module.exports={
    uploads,
    storage,
    categoryUpload

}