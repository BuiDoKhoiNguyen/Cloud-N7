import { Button, Popover, Modal, Tabs } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { AiOutlineLike } from "react-icons/ai"
import { useQuery } from 'react-query'
import { UserAccount } from '../../../components'
import { useUser } from '@/hooks/user'
import LikePostApi from '../services/LikePostApi'
import { formatDate } from '@/utils'

const emotions = [{
  label: 'like',
  icon: '👍'
}, {
  label: 'love',
  icon: '❤️'
}, {
  label: 'haha',
  icon: '😂'
}, {
  label: 'wow',
  icon: '😮'
}, {
  label: 'sad',
  icon: '😢'
}, {
  label: 'angry',
  icon: '😡'
}]

function Detail({ id }) {
  const query = useQuery({
    queryKey: ['likeposts', id],
    queryFn: () => LikePostApi.get({ q: { post: id } }),
    initialData: []
  })
  const group = useMemo(() => Map.groupBy(query.data, ({ type }) => type), [query.data])
  const [type, setType] = useState(emotions[0].icon)

  return <div>
    <Tabs defaultActiveKey={type} onChange={setType} className="flex gap-2" items={
      emotions.map(e => ({
        key: e.icon,
        label: <div>{e.icon} {e.label}</div>,
        children: (
          <div className="flex flex-col gap-3">
            {group.get(e.icon)?.map(like => (
              <div key={like.user} className="flex gap-10 justify-between items-center">
                <UserAccount id={like.user} />
                <div className="">{formatDate(like.createdAt, "fromNow")}</div>
              </div>
            ))}
          </div>
        )
      }))
    } />
  </div>
}

export function LikePostDetail({ post, popup = true }) {
  const [open, setOpen] = useState(false)

  return <div>
    <Modal centered open={open} onCancel={() => setOpen(false)} closable={false} footer={[
      <Button onClick={() => setOpen(false)} key="ok" type="primary" >
        OK
      </Button>,
    ]}>
      <Detail id={post._id} />
    </Modal >
    <Button type='text' size='' onClick={() => setOpen(popup)} className="flex items-center gap-1">
      <div className='font-semibold'>{post.like_total ? `${emotions.slice(0, 3).reduce((a, b) => a + b.icon, '')}${post.like_total}` : "Chưa có lượt thích"}</div>
    </Button>
  </div >
}

export function LikePost({ id }) {
  const { user } = useUser()
  const [like, setLike] = useState()

  useEffect(() => {
    LikePostApi.get({ q: { post: id, user: user._id } }).then(res => setLike(res[0]))
  }, [])

  const handleCreate = (type) => {
    setLike({ type })
    LikePostApi.create({ post: id, type })
  }

  const handleDelete = () => {
    setLike(null)
    LikePostApi.delete({ post: id })
  }

  return (
    <Popover content={<div className='flex'>
      <div className="flex gap-2">{emotions.map(e => <div key={e} onClick={() => handleCreate(e)} className=" hover:-translate-y-1 transition-transform text-xl">{e.icon}</div>)}</div>
    </div>}>
      <Button
        onClick={e => {
          if (!like) {
            handleCreate(emotions[0].icon)
          } else {
            handleDelete()
          }
        }}
        icon={like ? <span >{like.type}</span> : <AiOutlineLike />}
        type='text'
      >
        <div className={`text-sm font-semibold capitalize ${like && 'text-primary'}`}>{like ? 'Liked' : 'Like'}</div>
      </Button>
    </Popover>
  )
}