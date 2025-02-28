import { Button, Card, Input, Tag } from "antd";
import { PiArrowLeftThin } from "react-icons/pi";
import { useSearchParams } from 'react-router-dom';
import { CreateGroupChat, CreateMessage, GroupChatCard, GroupChatsWrapper, GroupHeader, Messages } from '../features/chat';

function Messenger({ groupchats, loadMore, hasMore }) {

  const [param, setParam] = useSearchParams()
  const id = param.get('id')

  return <div className='p-3 bg-background h-[calc(100vh-4rem)] max-w-[1200px] mx-auto flex gap-5'>
    <div
      className={` max-h-full flex flex-col gap-5 w-96 bg-surface text-onSurface p-5 rounded ${id ? 'max-md:hidden' : 'grow'}`}>
      <div className="flex justify-between items-center gap-3">
        <div className="flex gap-3 items-center ">
          <div className=" font-semibold">Active chats</div>
          <Tag color="green">{groupchats.length}</Tag>
          <div className="grow"></div>
        </div>
        <CreateGroupChat />
      </div>
      <Input.Search placeholder="Search" />
      <div className="flex flex-col gap-3 overflow-y-auto">
        {
          groupchats.map(e => <div className={`${id == e._id ? 'bg-primary/30' : 'hover:bg-background'} cursor-pointer `} onClick={() => { param.set('id', e._id); setParam(param) }} key={e._id}>
            <GroupChatCard groupchat={e} />
          </div>)
        }
      </div>
    </div>

    {id && <div className={`${id ? '' : 'max-md:hidden'} bg-surface text-onSurface grow flex flex-col max-h-full`}>
      <div className="sticky z-1 text-primary p-3 top-0 flex justify-between border-b-1 border-onSurface/30">
        <Button className="!rounded-full" icon={<PiArrowLeftThin />} type="primary" size="small" onClick={() => { param.delete('id'); setParam(param) }} />
        <GroupHeader id={id} />
      </div>
      <div className="grow p-3 overflow-y-auto">
        <Messages key={id} id={id} />
      </div>
      <div className=" bg-surface text-onSurface p-5"><CreateMessage id={id} /></div>
    </div>}
  </div>
}

export default function Page() {
  return <GroupChatsWrapper>
    <Messenger />
  </GroupChatsWrapper>
}