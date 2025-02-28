import { memo } from 'react'
import { useQuery } from 'react-query'
import { FilePreview, UserAccount } from '../../../components'
import { Button } from '../../../components/ui'
import { useUser } from '../../../hooks/user'
import { parseDate } from '../../../utils/parseDate'
import MessageApi from '../services/message'
import { formatDate } from '@/utils'

function Message({ message }) {
  return <div className=' flex flex-col gap-2 break-all'>
    {message.content}
    {message.files.map(t => <div key={t}><FilePreview id={t} /></div>)}
  </div>
}


function Call({ call }) {
  return <div className=' flex flex-col gap-2'>
    <div>Đã bắt đầu một cuộc gọi</div>
    {call.status == 'ended' ? 'Đã kết thúc' : 'Đang diễn ra'}
  </div>
}

function Vote({ vote }) {
  return <div className=' flex flex-col gap-2'>
    {vote.content}
    {vote.files.map(t => <div key={t}><File needToNavigate={true} id={t} /></div>)}
    <div className="p-5 bg-grey rounded-lg flex flex-col gap-2">
      {vote.options.map(e => <div key={e.name} className=" flex gap-5 items-center justify-between">
        <div>{e.name}</div>
        <Button className={'btn-teal'}>Bình chọn</Button>
      </div>)}
    </div>
  </div>
}

export default memo(({ id }) => {
  const { user } = useUser()
  const query = useQuery({
    queryKey: ['message', id],
    queryFn: () => MessageApi.getById(id)
  })

  if (query.isLoading || query.isError) return <></>

  const message = query.data
  const isMine = message.user == user._id

  return <div className={`flex gap-2 ${isMine ? 'items-end flex-row-reverse' : ''} items-start`} key={id}>
    {!isMine && <UserAccount id={message.user} displayName={false} />}
    <div className='flex flex-col gap-2'>
      <div title={parseDate(message.createdAt)} className={`${isMine ? 'bg-primary text-onPrimary rounded-l-md' : 'bg-background text-onBackground rounded-r-md'} rounded-t-md p-3 flex flex-col gap-5 max-w-80`}>
        {message.type == 'message' && <Message message={message} />}
        {message.type == 'vote' && <Vote vote={message} />}
        {message.type == 'call' && <Call call={message} />}
      </div>
      <div className={`${isMine ? 'text-end' : ""} text-sm`}>{formatDate(message.createdAt, "timeShort")}</div>
    </div>
  </div>

})





