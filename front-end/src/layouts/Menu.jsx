import { IconButton, Switch } from "@mui/material";
import { useContext, useState } from "react";
import { CgShoppingCart } from "react-icons/cg";
import { FaFacebookMessenger, FaUserFriends } from "react-icons/fa";
import { GrGroup } from "react-icons/gr";
import { IoMdMenu } from "react-icons/io";
import { IoGameController } from "react-icons/io5";
import { MdOutlineOndemandVideo } from "react-icons/md";
import { Link } from "react-router-dom";
import { useUser } from "../hooks/user";
import CommonContext from "../store/CommonContext";

export default function () {
  const { darkMode, setDarkMode } = useContext(CommonContext)
  const { user } = useUser()
  const [open, setOpen] = useState(false)
  return <div className=" relative">
    <IconButton onClick={() => setOpen(!open)} color={open ? 'primary' : 'inherit'}>
      <IoMdMenu className="w-6 h-6" />
    </IconButton>
    <div className={` max-sm:fixed max-sm:top-14 max-sm:left-0 max-sm:w-full h-max absolute w-max overflow-hidden -bottom-2 sm:translate-y-full right-0 bg-surface text-onSurface shadow-md rounded-b-lg transition-[max-height] duration-500 ${open ? 'max-h-[400px]' : 'max-h-0'}`}>
      <Link onClick={() => setOpen(false)} to={`/users/${user._id}`} className='flex gap-5 btn py-2 hover:bg-primary/20 px-5'>
        <img className={'w-6 h-6 overflow-hidden rounded-full object-cover'} src={user.avatar.url} />
        <div className='font-semibold'> {user.firstName} {user.lastName} </div>
      </Link>
      <Link onClick={() => setOpen(false)} to={'/friends'} className="flex gap-5 btn py-2 hover:bg-primary/20 px-5">
        <FaUserFriends className="w-6 h-6" />
        <div className="text-1">Bạn bè</div>
      </Link>
      <Link onClick={() => setOpen(false)} to={'/groups'} className="flex gap-5 btn py-2 hover:bg-primary/20 px-5">
        <GrGroup className="w-6 h-6" />
        <div className="text-1">Nhóm</div>
      </Link>
      <Link onClick={() => setOpen(false)} to={'/'} className="flex gap-5 btn py-2 hover:bg-primary/20 px-5">
        <CgShoppingCart className="w-6 h-6" />
        <div className="text-1">Marketplace</div>
      </Link>
      <Link onClick={() => setOpen(false)} to={'/'} className="flex gap-5 btn py-2 hover:bg-primary/20 px-5">
        <MdOutlineOndemandVideo className="w-6 h-6" />
        <div className="text-1">Video</div>
      </Link>
      <Link onClick={() => setOpen(false)} to={'/carogames'} className="flex gap-5 btn py-2 hover:bg-primary/20 px-5">
        <IoGameController className="w-6 h-6" />
        <div className="text-1">Game</div>
      </Link>
      <Link onClick={() => setOpen(false)} to={'/messages'} className="flex gap-5 btn py-2 hover:bg-primary/20 px-5">
        <FaFacebookMessenger className="w-6 h-6" />
        <div className="text-1">Messenger</div>
      </Link>
      <div className="flex gap-5 items-center btn text-1 py-2 px-5">
        <div>Chế độ tối</div>
        <Switch checked={darkMode} onChange={() => { setDarkMode(!darkMode) }} />
      </div>
    </div>
  </div>
}