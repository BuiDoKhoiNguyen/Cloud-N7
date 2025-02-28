import Post from '../models/Post.js'
import FileService from './file.js'
import GroupService from '../services/group.js'
import UserService from '../services/user.js'
import Redis from '../configs/init.redis.js'
import LikePost from '../models/LikePost.js'
import CommentPost from '../models/CommentPost.js'

class Service {
  get = async (query, page, limit) => {
    const posts = await Post.find(query).skip(page * limit).limit(limit).sort({ createdAt: -1 }).select("_id")
    const count = await Post.countDocuments(query)
    const hasMore = count > (page + 1) * limit
    return { posts, hasMore }
  }

  getById = async id => {
    // const cache = await Redis.client.json.get('post:' + id, "$")
    // if (cache) return cache
    const val = (await Post.findById(id)).toObject()
    val.user = await UserService.getById(val.user)
    val.like_total = await LikePost.countDocuments({ post: id })
    val.comment_total = await CommentPost.countDocuments({ post: id })
    val.share_total = await Post.countDocuments({ "ref.id": id, "ref.type": "Post" })
    if (val.group) val.group = await GroupService.getById(val.group)
    await Redis.client.json.set('post:' + id, '$', val)
    return val
  }

  create = async (user, data) => {
    if (data.group) return GroupService.haveRole(user, data.group, 'Member').then(() => Post.create(data))
    if (data.ref?.type === "Post") await Redis.client.json.numIncrBy('post:' + data.ref.id, '$.share_total', 1)
    return Post.create(data)
  }

  authorized = async (user, post) =>
    this.getById(post)
      .then(post => {
        if (post.user._id != user && post.type != 'Vote') throw new Error()
      })


  deleteById = async id => {
    const post = await Post.findById(id)
    await Promise.all(post.files.map(e => FileService.deleteById(e)))
    Redis.client.del('post:' + id)
    return post.deleteOne()
  }

  updateById = async (id, data) => {
    const post = await Post.findById(id)
    Promise.all(post.files.map(e => FileService.deleteById(e)))
    Redis.client.del('post:' + id)
    return post.updateOne(data)
  }

  voteById = async (id, data) => {
    const post = await Post.findOne({ _id: id, type: 'Vote' })
    if (data.type === 'remove') await post.updateOne({ $pull: { [`options.${data.option}.votes`]: data.user } })
    else await post.updateOne({ $addToSet: { [`options.${data.option}.votes`]: data.user } })
    await Redis.client.del('post:' + id)
    return post
  }
}


export default new Service()