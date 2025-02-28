import { formatDate } from '@/utils'
import { cloneElement, useEffect, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import GroupChatApi from '../services/groupChat'
import MessageApi from '../services/message'

export function GroupChatCard({ groupchat }) {

  const query = useQuery({
    queryKey: ['message', groupchat.lastMessage],
    queryFn: () => MessageApi.getById(groupchat.lastMessage).catch(() => {})
  })

  if(query.isLoading) return <></>

  return <div className='flex gap-5 items-center rounded-md px-5 py-2'>
    <img src="https://social.webestica.com/assets/images/avatar/01.jpg" alt="" className="w-12 h-12 rounded-full" />
    <div className="flex flex-col gap-2 grow">
      <div className='font-semibold'>{groupchat.name}</div>
      <div className="flex gap-2 justify-between text-sm">
        <div className='max-w-full overflow-hidden text-ellipsis'>{query.data?.content || "Đã gửi 1 tin nhắn"}</div>
        <div className='shrink-0'>{formatDate(query.data?.createdAt, "relativeDay")}</div>
      </div>
    </div>
  </div>
}

export function GroupChatsWrapper({ children, page = 0, limit = 10, query = {} }) {
  const [groupchats, setGroupChats] = useState([])
  const hasMoreRef = useRef(false)
  const pageRef = useRef(page)

  const loadMore = async () => {
    if (hasMoreRef.current) {
      await GroupChatApi.get({ q: query, page: pageRef.current }).then(async e => {
        hasMoreRef.current = e.hasMore
        pageRef.current++
        setGroupChats(prev => [...prev, ...e.groupchats])
      })
    }
  }

  useEffect(() => {
    GroupChatApi.get({ q: query, page: page, limit: limit }).then(e => {
      hasMoreRef.current = e.hasMore
      pageRef.current = page + 1
      setGroupChats(e.groupchats)
    })
  }, [])

  return <div>
    {cloneElement(children, { groupchats, loadMore, hasMore: hasMoreRef.current })}
  </div>
}

export default function GroupChats({ cb, page = 0, limit = 10, query = {} }) {

  const [groupchats, setGroupChats] = useState([])
  const hasMoreRef = useRef(false)
  const pageRef = useRef(page)

  const loadMore = async () => {
    if (hasMoreRef.current) {
      await GroupChatApi.get({ q: query, page: pageRef.current }).then(e => {
        hasMoreRef.current = e.hasMore
        pageRef.current++
        setGroupChats(prev => [...prev, ...e.groupchats])
      })
    }
  }

  useEffect(() => {
    GroupChatApi.get({ q: query, page: page, limit: limit }).then(e => {
      hasMoreRef.current = e.hasMore
      pageRef.current = page + 1
      setGroupChats(e.groupchats)
    })
  }, [])

  return <div className='flex flex-col gap-2'>
    {groupchats.map(cb)}
  </div>
}