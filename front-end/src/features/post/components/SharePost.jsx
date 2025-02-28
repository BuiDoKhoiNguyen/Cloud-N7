import { Button, Form, Input, Modal } from 'antd'
import { useRef, useState } from 'react'
import { CiShare2 } from 'react-icons/ci'
import { FaShare } from 'react-icons/fa'
import { MdShare } from 'react-icons/md'
import { useUser } from '@/hooks/user'
import PostApi from '../services/PostApi'

export function SharePost({ id, type = "Post" }) {
  const [open, setOpen] = useState(false)
  const contentRef = useRef()
  const { user } = useUser()

  const [form] = Form.useForm()

  const onFinish = async (values) => {
    try {
      const formData = new FormData()
      formData.append('content', values.content)
      formData.append('type', 'Normal')
      formData.append("ref[type]", type)
      formData.append("ref[id]", id)
      await PostApi.create(formData)
      setOpen(false)
    } catch (error) {
      console.error("Error sharing post:", error)
    }
  }

  return <div className="">
    <Modal open={open} onCancel={() => setOpen(false)} okText='Share' onOk={form.submit}>
      <Form form={form} onFinish={onFinish} className='flex flex-col gap-3'>
        <div className='flex gap-2 items-center'>
          <img className={'w-8 h-8 overflow-hidden rounded-full object-cover'} src={user.avatar.url} />
          <div className='font-semibold'> {user.firstName} {user.lastName} </div>
          <div className="grow"></div>
        </div>
        <Form.Item name='content' rules={[{ required: true, message: 'Content is required' }]}>
          <Input.TextArea placeholder='Write something' inputRef={contentRef} />
        </Form.Item>
      </Form>
    </Modal>

    {type === "Post" && <Button type='text' onClick={() => setOpen(true)} icon={<CiShare2 />}>
      <div className='text-sm font-semibold capitalize'>Share</div>
    </Button>}

    {type === "Event" && <Button icon={<MdShare />} type='text' onClick={() => setOpen(true)}>
    </Button>}
  </div>
}

export function SharePostDetail({ post }) {
  return <Button type='text' icon={<FaShare />}>
    {post.share_total}
  </Button>
}