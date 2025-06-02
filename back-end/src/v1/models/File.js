import mongoose from 'mongoose'

const File = new mongoose.Schema({
  url: String,
  type: String,
  name: String,
  s3Key: String, 
  transformations: Object,
  _system: String,
}, { timestamps: true })

export default mongoose.model('Files', File)