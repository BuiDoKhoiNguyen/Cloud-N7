import Joi from "joi";

const query = Joi.object({
  type: Joi.string().valid("suggested", "joined", "friends", "near").required(),
  page: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(1).max(100).default(10),
  skip: Joi.number().integer().min(0).default(0),
}).unknown(true);

const create = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  avatar: Joi.string(),
})
  .unknown(false)
  .required();

const update = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  avatar: Joi.string(),
})
  .unknown(false)
  .required();

export { create, update, query };
