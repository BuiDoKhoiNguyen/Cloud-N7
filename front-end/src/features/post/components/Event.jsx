import { Button, Form, Input, Modal, Upload } from 'antd'
import { cloneElement, useEffect, useRef, useState } from 'react'
import { MdOutlineFavoriteBorder } from 'react-icons/md'
import { useUser } from '../../../hooks/user'
import EventApi from '../services/EventApi'

export function AttendEvent({ event }) {
  const [isAttendee, setIsAttendee] = useState(event.isAttendee)

  const attend = async () => {
    try {
      if (isAttendee) {
        await EventApi.unattend(event._id)
      } else {
        await EventApi.attend(event._id)
      }
      setIsAttendee(!isAttendee)
    } catch (error) {

    }
  }

  return <Button icon={<MdOutlineFavoriteBorder />} type={isAttendee ? 'primary' : ''} onClick={attend}>
    <div className="text-sm capitalize">{isAttendee ? "Attended" : "Attend"}</div>
  </Button>
}

export function EventsWrapper({ children, page = 0, limit = 10, query = {} }) {
  const [events, setEvents] = useState([]);
  const hasMoreRef = useRef(false)
  const pageRef = useRef(page)

  const loadMore = async () => {
    if (hasMoreRef.current) {
      await EventApi.get({ q: query }).then(e => {
        hasMoreRef.current = e.hasMore
        pageRef.current++
        setEvents(prev => [...prev, ...e.events])
      })
    }
  }

  useEffect(() => {
    EventApi.get({ q: query, page: page, limit: limit }).then(e => {
      hasMoreRef.current = e.hasMore
      pageRef.current = page + 1
      setEvents(e.events)
    })
  }, [])

  return <div>
    {cloneElement(children, { events, loadMore, hasMore: hasMoreRef.current })}
  </div>
}

export function CreateEvent({ data }) {
  const [open, setOpen] = useState(false)
  const { user } = useUser()
  const [form] = Form.useForm()
  const cover = Form.useWatch('cover', form)
  const imageURL = cover?.fileList?.length && URL.createObjectURL(cover.fileList[0].originFileObj)

  const onFinish = async (values) => {
    try {
      const formData = new FormData()
      formData.append('title', values.title)
      formData.append('description', values.description)
      formData.append('category', values.category)
      formData.append('time', values.time)
      formData.append('location', values.location)
      formData.append('cover', values.cover.fileList[0].originFileObj)
      await EventApi.create(formData)
      setOpen(false)
    }
    catch (err) {
      console.error(err)
    }
  }

  return <div>
    <Modal open={open} onOk={() => form.submit()} onCancel={() => setOpen(false)} title={
      <div className='flex gap-2 items-center'>
        <img className={'w-8 h-8 overflow-hidden rounded-full object-cover'} src={user.avatar.url} />
        <div className='font-semibold'>{user.firstName} {user.lastName} </div>
      </div>
    }>
      <Form onFinish={onFinish} form={form}>
        <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please input the title!' }]}>
          <Input required label={'Title'} />
        </Form.Item>
        <Form.Item label="Description" name="description" rules={[{ required: true, message: 'Please input the description!' }]}>
          <Input required label={'Description'} multiline />
        </Form.Item>
        <Form.Item label="Category" name="category" rules={[{ required: true, message: 'Please input the category!' }]}>
          <Input required label={'Category'} />
        </Form.Item>
        <Form.Item label="Time" name="time" rules={[{ required: true, message: 'Please input the time!' }]}>
          <Input required placeholder={'Time'} type="datetime-local" />
        </Form.Item>
        <Form.Item label="Location" name="location" rules={[{ required: true, message: 'Please input the location!' }]}>
          <Input required label={'Location'} />
        </Form.Item>
        <Form.Item label="Cover Image" name="cover" rules={[{ required: true, message: 'Please upload a cover image!' }]}>
          <Upload maxCount={1} beforeUpload={() => false} accept="image/*" >
            <Button >Tải lên ảnh bìa</Button>
          </Upload>
        </Form.Item>
        {imageURL && <img className='w-full h-64 object-cover rounded-md' src={imageURL} alt="cover" />}
      </Form>
    </Modal>
    <Button onClick={() => setOpen(true)} type='primary'>Create event</Button>
  </div>
}


