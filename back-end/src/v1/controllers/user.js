import Joi from 'joi'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import UserService from '../services/user.js'
import { stat } from 'fs'

const creatingPattern = Joi.object({
  phoneNumber: Joi.string().trim().required().pattern(/^\d*$/),
  email: Joi.string().email().trim().required(),
  password: Joi.string().required().pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,16}$/).messages({
    'string.pattern.base': 'Mật khẩu có độ dài từ 8 đến 16 chứa ít nhất 1 chữ cái in hoa, 1 chữ cái thường, 1 chữ số'
  }).custom((value, helpers) => bcrypt.hashSync(value, Number.parseInt(process.env.SALT_ROUNDS))),
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  avatar: Joi.string(),
}).unknown(false).required()

const updatingPattern = Joi.object({
  phoneNumber: Joi.string().trim().pattern(/^\d*$/),
  firstName: Joi.string().trim(),
  lastName: Joi.string().trim(),
  avatar: Joi.string(),
  birthday: Joi.string().allow(''),
  overview: Joi.string().allow(''),
  occupation: Joi.string().allow(''),
  address: Joi.string().allow(''),
  status: Joi.string().allow(''),
}).unknown(false).required()

const loginPattern = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().required(),
  remember: Joi.boolean().optional()
}).unknown(false).required()

const changePasswordPattern = Joi.object({
  oldPassword: Joi.string().required(),
  password: Joi.string().pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,16}$/).messages({
    'string.pattern.base': 'Mật khẩu có độ dài từ 8 đến 16 chứa ít nhất 1 chữ cái in hoa, 1 chữ cái thường, 1 chữ số'
  }).custom((value, helpers) => bcrypt.hashSync(value, Number.parseInt(process.env.SALT_ROUNDS))),
}).unknown(false).required()

const option = {
  maxAge: 1000 * 60 * 60 * 24 * 10,
  httpOnly: true,
  sameSite: 'None',
  secure: true,
}

class Controller {

  get = async (req, res, next) => {
    UserService.get(JSON.parse(req.query.q))
      .then(val => res.status(200).send(val))
      .catch(err => next(err))
  }

  getMe = (req, res, next) => {
    if (req.user) res.status(200).send(req.user)
    else next(new Error())
  }

  #getToken = _id => jwt.sign({ _id: _id }, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRE_IN, })

  getById = async (req, res, next) => {
    UserService.getById(req.params.id)
      .then(val => res.status(200).send(val))
      .catch(err => next(err))
  }

  create = async (req, res, next) => {
    creatingPattern.validateAsync(req.body)
      .then(val => UserService.create(val))
      .then(val => res.status(200).send(val))
      .catch(err => next(err))
  }

  update = async (req, res, next) => {
    updatingPattern.validateAsync(req.body)
      .then(val => UserService.update(req.user, val))
      .then(val => res.status(200).send(val))
      .catch(err => next(err))
  }

  changePassword = async (req, res, next) => {
    changePasswordPattern.validateAsync(req.body)
      .then(async val => UserService.changePassword(req.user, val))
      .then(val => res.status(200).send(val))
      .catch(err => next(err))
  }

  login = async (req, res, next) => {
    loginPattern.validateAsync(req.body)
      .then(val => UserService.login(val.email, val.password))
      .then(async val => {
        const user = await UserService.getById(val._id)
        res.cookie('access_token', this.#getToken(user._id), option)
        res.status(200).send(user)
      })
      .catch(err => next(err))
  }

  delete = (req, res, next) => {
    UserService.deleteById(req.user)
      .then(val => res.status(200).send(val))
      .catch(err => next(err))
  }

  getGroups = (req, res, next) => {
    UserService.getGroups(req.user._id)
      .then(val => res.status(200).send(val))
      .catch(err => next(err))
  }
}


export default new Controller()