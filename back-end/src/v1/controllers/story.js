import Story from '../models/Story.js';
import Joi from 'joi';
import RabbitMQ from '../configs/init.rabbitmq.js';
import Redis from '../configs/init.redis.js';
import FriendService from '../services/friend.js';
import StoryService from '../services/story.js';

const creatingPattern = Joi.object({
  content: Joi.string(),
  files: Joi.array().items(Joi.string()).required().min(1)
}).required().unknown(false)

class Controller {

  async #init() {
    const exchange = await RabbitMQ.channel.assertExchange('create_story', 'fanout', { durable: false });
    const queue = await RabbitMQ.channel.assertQueue('story');
    await RabbitMQ.channel.bindQueue(queue.queue, exchange.exchange, 'story');

    RabbitMQ.channel.consume(queue.queue, async message => {
      try {
        const { user, _id } = JSON.parse(message.content.toString());
        await Redis.client.lPush(`story:${user}`, _id);
        const friends = await FriendService.getFriends(user);
        await Promise.all(friends.map(async friend => Redis.client.lPush(`story:${friend}`, _id)));
        RabbitMQ.channel.ack(message);
      } catch (error) {
        console.log(error)
        RabbitMQ.channel.nack(message);
      }
    });
  }

  constructor() {
    // this.#init()
  }

  async create(req, res, next) {
    try {
      const value = await creatingPattern.validateAsync(req.body);
      value.user = req.user._id;
      const story = await Story.create(value);
      await RabbitMQ.channel.publish('create_story', 'story', Buffer.from(JSON.stringify({ user: req.user._id, _id: story._id.toString() })));
      res.status(201).json(story);
    } catch (error) {
      next(error);
    }
  }

  async get(req, res, next) {
    try {
      const cache = await Redis.client.lRange(`story:${req.user._id}`, 0, -1);
      const data = await Promise.all(cache.map(StoryService.getById));
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const story = await StoryService.getById(req.params.id);
      res.status(200).json(story);
    } catch (error) {
      next(error);
    }
  }

  async deleteById(req, res, next) {
    try {
      const story = await Story.findById(req.params.id);
      if (!story) throw new Error('Story not found');
      if (story.user != req.user._id) throw new Error('Unauthorized');
      await story.delete();
      res.status(200).json(story);
    } catch (error) {
      next(error);
    }
  }

}

export default new Controller();