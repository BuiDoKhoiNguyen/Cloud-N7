import { IconButton } from "@mui/material";
import { useState } from "react";
import { FaFacebookMessenger } from "react-icons/fa";
import { IoClose, IoCloseCircle } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { CreateMessage, GroupChatCard, GroupChatsWrapper, GroupHeader, Messages } from '../features/chat';
import { Button } from "antd";

function Msg({ groupchats, setId }) {
  const [open, setOpen] = useState(false)

  return <div className="relative">
    <IconButton onClick={() => setOpen(!open)} color={open ? 'primary' : 'inherit'}>
      <FaFacebookMessenger className="w-6 h-6" />
    </IconButton>
    <div className={` max-sm:fixed max-sm:top-16 text-sm max-sm:left-0 max-sm:w-full h-max absolute w-max sm:max-w-[500px] overflow-y-auto -bottom-2 sm:translate-y-full right-0  rounded-b-lg transition-all duration-500 bg-surface text-onSurface shadow-md ${open ? 'max-h-[400px]' : 'max-h-0'}`}>
      {groupchats.map(e => <div onClick={() => { setId(e._id); setOpen(false) }} key={e._id} className="hover:bg-primary/20 cursor-pointer">
        <GroupChatCard groupchat={e} />
      </div>)}
    </div>
  </div>
}

export default function () {
  const [id, setId] = useState(false)

  return <div >

    <GroupChatsWrapper><Msg setId={setId} /></GroupChatsWrapper>

    {id && <div className="fixed z-20 bg-surface text-onSurface rounded-lg overflow-hidden flex flex-col shadow-lg right-5 bottom-12 h-[70%] w-[90%] max-w-[400px]">
      <div className=" p-5 flex justify-between border-b-1 border-onSurface/30">
        <Button className="!rounded-full" onClick={() => setId(null)} type="primary" size="small" icon={<IoClose />} />
        <GroupHeader id={id} />
      </div>
      <div className="p-5 flex flex-col grow gap-5 overflow-y-auto">
        <Messages id={id} />
      </div>
      <div className="p-5  border-t-1 border-onSurface/30">
        <CreateMessage id={id} />
      </div>
    </div>}
  </div>
}