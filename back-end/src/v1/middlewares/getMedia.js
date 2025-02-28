import fs from 'fs'
import path from 'path'
import File from '../models/File.js'
import { v2 as cloudinary } from 'cloudinary'

import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const FOLDER = process.env.CLOUDINARY_FOLDER

export default async function (req, res, next) {
  try {
    if (req.file) {
      const filePath = path.join(__dirname, '..', '..', '..', 'uploads', req.file.filename)
      const uploaded = await cloudinary.uploader.upload(filePath, { folder: FOLDER })
      const file = await File.create({
        url: uploaded.url,
        type: req.file.mimetype,
        name: req.file.originalname
      })
      req.body[req.file.fieldname] = file._id.toString()
      fs.unlink(filePath, err => { })
    } else if (req.files?.length) {
      req.body[req.files[0].fieldname] = await Promise.all(req.files.map(async e => {
        const filePath = path.join(__dirname, '..', '..', '..', 'uploads', e.filename)
        const uploaded = await cloudinary.uploader.upload(filePath, { folder: FOLDER, resource_type: 'auto' })
        const file = await File.create({
          url: uploaded.url,
          type: e.mimetype,
          name: e.originalname
        })
        fs.unlink(filePath, err => { })
        return file._id.toString()
      }))
    }
  } catch (err) {
    next(err)
  }

  next()
}