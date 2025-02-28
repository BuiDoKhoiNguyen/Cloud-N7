import { FaFacebook } from "react-icons/fa6";
import { RiFindReplaceLine } from "react-icons/ri";
import { FaHome } from "react-icons/fa";
import { CgShoppingCart } from "react-icons/cg";
import { MdOutlineOndemandVideo, MdOutlineSearch } from "react-icons/md";
import { GrGroup } from "react-icons/gr";
import { IoGameController } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";
import { FilePreview } from "../components";
import Notification from "./Notification";
import Messenger from "./Messenger";
import Menu from "./Menu";
import { useUser } from "../hooks/user";
import { TextField } from "@mui/material";
import { Input } from "antd";

export default function () {
  const { user } = useUser();
  const location = useLocation();
  const path = location.pathname;

  if (path.startsWith("/login") || path.startsWith("/register")) return <></>;

  return (
    <div className="w-full flex justify-between gap-5 px-5 py-2 bg-surface text-onSurface shadow-xs">
      <div className="flex gap-5 items-center">
        <Link to={"/"}>
          <FaFacebook className="w-8 h-8 text-primary" />
        </Link>
        <Input.Search />
      </div>

      <div className="flex gap-1 max-lg:hidden">
        <Link
          to={"/"}
          className={`py-2 px-10 group relative ${path == "/"
            ? "text-primary border-primary"
            : "hover:bg-primary/10 border-transparent active:bg-primary/20"
            } transition-colors border-b-2`}
        >
          <FaHome className="w-6 h-6" />
        </Link>
        <div
          className={`py-2 px-10 group relative ${path.startsWith("/watch")
            ? "text-primary border-primary"
            : "hover:bg-primary/10 border-transparent active:bg-primary/20"
            } transition-colors border-b-2`}
        >
          <MdOutlineOndemandVideo className="w-6 h-6" />
        </div>
        <div
          className={`py-2 px-10 group relative ${path.startsWith("/market")
            ? "text-primary border-primary"
            : "hover:bg-primary/10 border-transparent active:bg-primary/20"
            } transition-colors border-b-2`}
        >
          <CgShoppingCart className="w-6 h-6" />
        </div>
        <Link
          to={"/groups"}
          className={`py-2 px-10 group relative ${path.startsWith("/groups")
            ? "text-primary border-primary"
            : "hover:bg-primary/10 border-transparent active:bg-primary/20"
            } transition-colors border-b-2`}
        >
          <GrGroup className="w-6 h-6" />
        </Link>
        <Link
          to={"/carogames"}
          className={`py-2 px-10 group relative  ${path.startsWith("/carogames")
            ? "text-primary border-primary"
            : "hover:bg-primary/10 border-transparent active:bg-primary/20"
            } transition-colors border-b-2`}
        >
          <IoGameController className="w-6 h-6" />
        </Link>
      </div>

      <div className="flex gap-1 items-center justify-end shrink-0">
        <Menu />
        <Messenger />
        <Notification />
        <Link to={"/users/" + user._id}>
          <img
            className={"w-8 h-8 overflow-hidden rounded-full object-cover"}
            src={user.avatar.url}
          ></img>
        </Link>
      </div>
    </div>
  );
}
