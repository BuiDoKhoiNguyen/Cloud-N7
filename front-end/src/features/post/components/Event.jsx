import { Dialog, IconButton, TextField } from '@mui/material'
import { Button, Modal, Input, Form } from 'antd'
import { cloneElement, useEffect, useRef, useState } from 'react'
import { IoClose } from 'react-icons/io5'
import { MdOutlineFavoriteBorder, MdShare } from 'react-icons/md'
import { useUser } from '../../../hooks/user'
import EventApi from '../services/EventApi'
import PostApi from '../services/PostApi'
import { FileInput } from "../../../components/ui"

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

  return <Button fullWidth color="primary" variant={isAttendee ? "contained" : "outlined"} onClick={attend}>
    <div className="flex gap-2 justify-center">
      <MdOutlineFavoriteBorder className="w-5 h-5" />
      <div className="text-sm capitalize">{isAttendee ? "Unattend" : "Attend"}</div>
    </div>
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
  const [image, setImage] = useState()
  const titleRef = useRef(), descriptionRef = useRef(), categoryRef = useRef(), timeRef = useRef(), locationRef = useRef()
  const { user } = useUser()

  const onSubmit = async () => {
    try {
      if (!titleRef.current.value || !descriptionRef.current.value || !categoryRef.current.value || !timeRef.current.value || !locationRef.current.value || !image) throw new Error('Please fill all fields')
      const formData = new FormData()
      data && Object.entries(data).forEach(([key, value]) => formData.append(key, value))
      formData.append('title', titleRef.current.value)
      formData.append('description', descriptionRef.current.value)
      formData.append('category', categoryRef.current.value)
      formData.append('time', timeRef.current.value)
      formData.append('location', locationRef.current.value)
      formData.append('cover', image)
      await EventApi.create(formData)
      setOpen(false)
    } catch (err) {

    }
  }

  return <div>
    <Modal open={open} onCancel={() => setOpen(false)} title={
      <div className='flex gap-2 items-center'>
        <img className={'w-8 h-8 overflow-hidden rounded-full object-cover'} src={user.avatar.url} />
        <div className='font-semibold'>{user.firstName} {user.lastName} </div>
      </div>
    }>
      <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please input the title!' }]}>
        <Input required label={'Title'} inputRef={titleRef} variant='standard' />
      </Form.Item>
      <Form.Item label="Description" name="description" rules={[{ required: true, message: 'Please input the description!' }]}>
        <Input required label={'Description'} inputRef={descriptionRef} variant='standard' multiline />
      </Form.Item>
      <Form.Item label="Category" name="category" rules={[{ required: true, message: 'Please input the category!' }]}>
        <Input required label={'Category'} inputRef={categoryRef} variant='standard' />
      </Form.Item>
      <Form.Item label="Time" name="time" rules={[{ required: true, message: 'Please input the time!' }]}>
        <Input required placeholder={'Time'} type="datetime-local" inputRef={timeRef} variant='standard' />
      </Form.Item>
      <Form.Item label="Location" name="location" rules={[{ required: true, message: 'Please input the location!' }]}>
        <Input required label={'Location'} inputRef={locationRef} variant='standard' />
      </Form.Item>
      <div className="flex gap-2 justify-center items-center">
        <div className="font-semibold">Thêm ảnh</div>
        <FileInput accept="image/*" onChange={e => setImage(e.target.files[0])}></FileInput>
      </div>
      {image && <img src={URL.createObjectURL(image)} className="h-60 object-cover" />}
      <Button onClick={onSubmit} variant='contained'>Create Event</Button>
    </Modal>
    <Button onClick={() => setOpen(true)} type='primary'>Create event</Button>
  </div>
}


