import Socket from '../configs/init.socket.js'
import LikePost from '../models/LikePost.js'
import Joi from 'joi'
import Notification from '../models/Notification.js'
import PostService from '../services/post.js'
import Redis from '../configs/init.redis.js'

const creatingPattern = Joi.object({
  post: Joi.string().required(),
  type: Joi.string().required()
}).unknown(false).required()

const deletingPattern = Joi.object({
  post: Joi.string().required()
}).unknown(false).required()

class Controller {
  create = async (req, res, next) => {
    try {
      const data = await creatingPattern.validateAsync(req.body)
      const val = await LikePost.create({ ...data, user: req.user._id })
      await Redis.client.json.numIncrBy('post:' + data.post, '$.like_total', 1)
      res.status(200).send(val)
      // const post = await PostService.getById(val.post)
      // if (post.user != req.user._id) {
      //   Notification.create({
      //     content: `${req.user.firstName + ' ' + req.user.lastName} vừa thích bài viết của bạn`,
      //     user: post.user,
      //     to: '/posts/' + post._id,
      //     key: JSON.stringify(['likeposts', { post: val.post }])
      //   })
      //     .then(() => Socket.io.emit('invalidate', ['notifications', post.user]))
      // }
    } catch (error) {
      next(error)
    }
  }

  delete = async (req, res, next) => {
    try {
      const data = await deletingPattern.validateAsync(req.body)
      const val = await LikePost.deleteOne({ ...data, user: req.user._id })
      await Redis.client.json.numIncrBy('post:' + data.post, '$.like_total', -1)
      res.status(200).send(val)
    } catch (error) {
      next(error)
    }
  }

  get = (req, res, next) =>
    LikePost.find(JSON.parse(req.query.q))
      .then(val => res.status(200).send(val))
      .catch(err => next(err))
}

export default new Controller()