import Group from "../models/Group.js";
import RoleInGroup from "../models/RoleInGroup.js";
import FileService from "./file.js";
import Redis from "../configs/init.redis.js";

class Controller {
  getById = async (id) => {
    const cache = await Redis.client.get("group:" + id);
    if (cache) return JSON.parse(cache);
    const group = (await Group.findById(id)).toObject();
    console.log(group);
    group.avatar = await FileService.getById(group.avatar);
    group.cover = await FileService.getById(group.cover);
    Redis.client.set("group:" + id, JSON.stringify(group));
    return group;
  };

  get = async ({ page, limit, skip, type }) => {
    const pipeline = [
      {
        $facet: {
          total: [
            {
              $count: "count",
            },
          ],
          data: [
            {
              $skip: page * limit + skip,
            },
            {
              $limit: limit,
            },
          ],
        },
      },
    ];
    const res = await Group.aggregate(pipeline);
    const total = res[0].total.length || res[0].total[0].count;
    return {
      data: res[0].data,
      hasMore: total > (page + 1) * limit + skip,
      page: page,
      total: total,
    };
  };

  create = async (user, data) => {
    return Group.create(data).then((group) =>
      RoleInGroup.create({
        user: user,
        group: group._id,
        role: "Admin",
      })
    );
  };

  updateById = async (id, data) => {
    return Group.findByIdAndUpdate(id, data, { new: true });
  };

  deleteById = async (id) => {
    return Group.findByIdAndDelete(id);
  };

  getMembers = async (id) => {
    return RoleInGroup.find({ group: id });
  };

  request = async (user, group) => {
    return RoleInGroup.create({
      group: group,
      user: user,
      role: "Requester",
    });
  };

  accept = async (user, group) => {
    return RoleInGroup.findOneAndUpdate(
      { user: user, group: group, role: "Requester" },
      { role: "Member" }
    );
  };

  delete = async (user, group) => {
    return RoleInGroup.deleteOne({ user: user, group: group });
  };

  haveRole = async (user, group, role) => {
    return RoleInGroup.findOne({ user: user, group: group }).then((val) => {
      if ((role == "Member" && val?.role == "Admin") || val?.role == role)
        return;
      throw new Error(`You must join the group`);
    });
  };

  getRole = async (user, group) => {
    return RoleInGroup.findOne({ user: user, group: group }).then((val) =>
      val ? val.role : ""
    );
  };
}

export default new Controller();
