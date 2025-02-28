import { Button, Popover, Modal, Tabs } from 'antd'
import { useQuery } from 'react-query'
import { useUser } from '../../../hooks/user'
import LikeCommentApi from '../services/LikeCommentApi'
import { useEffect, useMemo, useState } from 'react'
import { UserAccount } from '../../../components'
import { AiOutlineLike } from 'react-icons/ai'
import { formatDate } from '@/utils'

const emotions = [
  { label: 'like', icon: '👍' },
  { label: 'love', icon: '❤️' },
  { label: 'haha', icon: '😂' },
  { label: 'sad', icon: '😭' },
  { label: 'angry', icon: '😡' },
]

function CommentDetail({ id }) {
  const query = useQuery({
    queryKey: ['likecomments', id],
    queryFn: () => LikeCommentApi.get({ q: { comment: id } }),
    initialData: []
  })
  const group = useMemo(() => Map.groupBy(query.data, ({ type }) => type), [query.data])
  const [type, setType] = useState(emotions[0].icon)

  return (
    <Tabs
      defaultActiveKey={type}
      onChange={setType}
      className="flex gap-2"
      items={emotions.map(e => ({
        key: e.icon,
        label: <div>{e.icon} {e.label}</div>,
        children: (
          <div className="flex flex-col gap-3">
            {group.get(e.icon)?.map(like => (
              <div key={like.user} className="flex gap-10 justify-between items-center">
                <UserAccount id={like.user} />
                <div>{formatDate(like.createdAt, "fromNow")}</div>
              </div>
            ))}
          </div>
        )
      }))}
    />
  )
}

export function LikeCommentDetail({ id, popup = true }) {
  const [open, setOpen] = useState(false)

  const query = useQuery({
    queryKey: ['likecomments', id],
    queryFn: () => LikeCommentApi.get({ q: { comment: id } }),
    initialData: []
  })

  return (
    <div>
      <Modal centered open={open} onCancel={() => setOpen(false)} closable={false} footer={[
        <Button onClick={() => setOpen(false)} key="ok" type="primary">
          OK
        </Button>,
      ]}>
        <CommentDetail id={id} />
      </Modal>

      <Button onClick={() => setOpen(popup)} type="text" size="small" className="flex items-center gap-1">
        <div className='font-semibold'>
          {query.data.length
            ? `${[...new Set(query.data.map(d => d.type))].slice(0, 3).join('')}${query.data.length}`
            : 'Chưa có lượt thích'}
        </div>
      </Button>
    </div>
  )
}

export function LikeComment({ id }) {
  const { user } = useUser()
  const [like, setLike] = useState()

  useEffect(() => {
    LikeCommentApi.get({ q: { comment: id, user: user._id } }).then(res => setLike(res[0]))
  }, [])

  const handleCreate = (type) => {
    setLike({ type })
    LikeCommentApi.create({ comment: id, type })
  }

  const handleDelete = () => {
    setLike(null)
    LikeCommentApi.delete({ comment: id })
  }

  return (
    <Popover content={
      <div className="flex gap-2">
        {emotions.map(e => (
          <div key={e.icon} onClick={() => handleCreate(e.icon)} className="hover:-translate-y-1 transition-transform text-xl cursor-pointer">
            {e.icon}
          </div>
        ))}
      </div>
    }>
      <Button
        onClick={() => {
          if (!like) {
            handleCreate(emotions[0].icon)
          } else {
            handleDelete()
          }
        }}
        icon={like ? <span>{like.type}</span> : <AiOutlineLike />}
        type="text"
      >
        <div className={`text-sm font-semibold capitalize ${like && 'text-primary'}`}>{like ? 'Liked' : 'Like'}</div>
      </Button>
    </Popover>
  )
}
