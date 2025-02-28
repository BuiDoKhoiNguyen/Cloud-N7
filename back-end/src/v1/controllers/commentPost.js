import Joi from 'joi'
import Socket from '../configs/init.socket.js'
import CommentPost from '../models/CommentPost.js'
import File from '../models/File.js'
import CommentService from '../services/comment.js'
import Redis from '../configs/init.redis.js'

const creatingPattern = Joi.object({
  content: Joi.string(),
  files: Joi.when('content', {
    is: Joi.exist(),
    then: Joi.array().items(Joi.string()).default([]),
    otherwise: Joi.array().items(Joi.string()).min(1).required()
  }),
  post: Joi.string().required(),
  comment: Joi.string().default(''),
}).unknown(false).required()

const updatingPattern = Joi.object({
  content: Joi.string(),
  files: Joi.array().items(Joi.string()),
}).unknown(false).required()

class Controller {

  get = async (req, res, next) => {
    try {
      const page = Number.parseInt(req.query.page)
      const limit = Number.parseInt(req.query.limit)
      const q = JSON.parse(req.query.q)
      const comments = await CommentPost.find(q).skip(page * limit).limit(limit)
      const count = await CommentPost.countDocuments(q)
      const hasMore = count > (page + 1) * limit
      res.status(200).send({ comments, hasMore })
    } catch (error) {
      next(error)
    }
  }

  getById = (req, res, next) =>
    CommentService.findById(req.params.id)
      .then(val => res.status(200).send(val))
      .catch(err => next(err))

  create = async (req, res, next) => {
    try {
      const data = await creatingPattern.validateAsync(req.body)
      const val = await CommentPost.create({ ...data, user: req.user._id })
      await Redis.client.json.numIncrBy('post:' + data.post, '$.comment_total', 1)
      res.status(200).send(val)
      Socket.io.to(`post-${val.post}`).emit('new_comment', val)
    } catch (error) {
      next(error)
    }
  }

  deleteById = async (req, res, next) => {
    try {
      const val = await CommentPost.findById(req.params.id)
      if (val.user != req.user._id) throw new Error()
      await Promise.all(val.files.map(e => File.findByIdAndDelete(e)))
      await Redis.client.json.numIncrBy('post:' + val.post, '$.comment_total', -1)
      await val.deleteOne()
      res.status(200).send(val)
    } catch (error) {
      next(error)
    }

  }
  
  updateById = (req, res, next) =>
    updatingPattern.validateAsync(req.body)
      .then(val => CommentPost.findById(req.params.id)
        .then(async data => {
          await Promise.all(val.files.map(e => File.findByIdAndDelete(e)))
          if (data.user == req.user._id) return data.updateOne(val, { new: true })
          throw new Error()
        }))
      .then(val => res.status(200).send(val))
      .catch(err => next(err))
}

export default new Controller()