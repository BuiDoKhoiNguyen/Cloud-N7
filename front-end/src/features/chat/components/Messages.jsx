import { useMutation } from "react-query";
import MessageApi from '../services/message';
import Message from './Message';
import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../../hooks/socket"


export default function ({ id, limit = 10}) {
  const hasMoreRef = useRef(true), pageRef = useRef(0), loadingRef = useRef(), lastRef = useRef()
  const [messages, setMessages] = useState([])
  const {socket} = useSocket()

  const mutation = useMutation({
    mutationFn: () => MessageApi.get({ page: pageRef.current, limit, q:{ groupChat: id } }),
    onSuccess: data => {
      hasMoreRef.current = data.hasMore
      pageRef.current += 1
      setMessages(prev => [...data.messages, ...prev])
    }
  })

  useEffect(() => {
    const listener = data => {
      setMessages(prev => [...prev, data])
      setTimeout(() => lastRef.current?.scrollIntoView(), 500)
    }
    socket.on('create_message', listener)
    socket.emit('join', `group_chat_${id}`)
    return () => {
      socket.emit('leave', `group_chat_${id}`)
      socket.off('create_message', listener)
    }
  }, [])

  useEffect(() => {
    pageRef.current = 0
    hasMoreRef.current = true
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && hasMoreRef.current) mutation.mutate()
      })
    }, {
      rootMargin: '300px'
    })

    if (loadingRef.current) observer.observe(loadingRef.current)
    return () => {
      if (loadingRef.current) observer.unobserve(loadingRef.current)
      observer.disconnect()
    }
  }, [])

  return <div className="flex flex-col gap-3">
    <div ref={loadingRef}></div>
    {messages.map((e, i) => <div ref={(i === messages.length - 1 ? lastRef : null)} key={e._id}><Message id={e._id} /></div>)}
  </div>
}