import GroupService from "../services/group.js";
import PostService from "../services/post.js";
import UserService from "../services/user.js";
import { GroupRequest } from "../validations/index.js";

class Controller {
  getById = async (req, res, next) => {
    GroupService.getRole(req.user._id, req.params.id)
      .then((role) =>
        GroupService.getById(req.params.id).then((val) =>
          res.status(200).json({ ...val, role: role })
        )
      )
      .catch((err) => {
        console.log(err);
        next(err);
      });
  };

  get = async (req, res, next) => {
    try {
      const query = GroupRequest.query.validateAsync(req.query);
      const res = await GroupService.get(query);
      res.status(200).send(val);
    } catch (err) {
      next(err);
    }
  };

  create = (req, res, next) => {
    GroupRequest.create
      .validateAsync(req.body)
      .then((val) => GroupService.create(req.user._id, val))
      .then((val) => res.status(200).send(val))
      .catch((err) => next(err));
  };

  updateById = (req, res, next) => {
    GroupService.haveRole(req.user._id, req.params.id, "Admin")
      .then(() => GroupRequest.update.validateAsync(req.body))
      .then((val) => GroupService.updateById(req.params.id, val))
      .then((val) => res.status(200).send(val))
      .catch((err) => next(err));
  };

  deleteById = (req, res, next) => {
    GroupService.haveRole(req.user._id, req.params.id, "Admin")
      .then(() => GroupService.deleteById(req.params.id))
      .then((val) => res.status(200).send(val))
      .catch((err) => next(err));
  };

  getMembers = (req, res, next) => {
    GroupService.haveRole(req.user._id, req.params.id, "Member")
      .then(() => GroupService.getMembers(req.params.id))
      .then((val) => res.status(200).send(val))
      .catch((err) => next(err));
  };

  request = (req, res, next) => {
    GroupService.request(req.user._id, req.params.id)
      .then((val) => res.status(200).send(val))
      .catch((err) => next(err));
  };

  accept = (req, res, next) => {
    GroupService.haveRole(req.user._id, req.params.id, "Admin")
      .then(() => GroupService.accept(req.body.user, req.params.id))
      .then((val) => res.status(200).send(val))
      .catch((err) => next(err));
  };

  delete = (req, res, next) => {
    GroupService.haveRole(req.user._id, req.params.id, "Admin")
      .then(() => GroupService.delete(req.body.user, req.params.id))
      .then((val) => res.status(200).send(val))
      .catch((err) => next(err));
  };

  getPosts = async (req, res, next) => {
    try {
      const groups = await UserService.getGroups(req.user._id);
      const query = JSON.parse(req.query.q);
      query.group = { $in: groups };
      const val = await PostService.get(
        query,
        Number.parseInt(req.query.page),
        Number.parseInt(req.query.limit)
      );
      res.status(200).send(val);
    } catch (error) {
      next(error);
    }
  };
}

export default new Controller();
