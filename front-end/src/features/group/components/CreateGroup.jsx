import { UserAccount } from '@/components'
import { useUser } from '@/hooks/user'
import { Button, Form, Input, Modal, Upload } from 'antd'
import { useState } from 'react'
import GroupApi from '../services/GroupApi'

export default function () {
  const { user } = useUser()
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const onFinish = async (values) => {
    try {
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('description', values.description)
      values.avatar?.fileList?.length && formData.append('avatar', values.avatar.fileList[0].originFileObj)
      await GroupApi.create(formData)
      setOpen(false)
    } catch (error) {
      console.error("Error creating group:", error)
    }
  }


  return <div>
    <Modal title={<UserAccount id={user._id} />} open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} >
      <Form onFinish={onFinish} form={form}>

        <Form.Item name={'name'} rules={[{ required: true, message: 'Vui lòng nhập tên nhóm' }]} label='Tên nhóm'>
          <Input placeholder='Tên nhóm' />
        </Form.Item>
        <Form.Item name={'description'} rules={[{ required: true, message: 'Vui lòng nhập mô tả nhóm' }]} label='Mô tả nhóm'>
          <Input placeholder='Mô tả nhóm' />
        </Form.Item>
        <Form.Item name={'avatar'} label='Ảnh đại diện nhóm'>
          <Upload
            accept='image/*'
            maxCount={1}
            beforeUpload={() => false}
          >
            <Button>Chọn ảnh</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal >
    <Button type='primary' onClick={() => setOpen(true)}>Tạo nhóm mới</Button>
  </div >
}