import { Dialog, IconButton, TextField } from "@mui/material";
import { Button, Modal, Input, Form } from 'antd'
import { useRef, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useQuery, useQueryClient } from "react-query";
import { toast } from 'react-toastify';
import { useUser } from "../../../hooks/user";
import UserApi from '../../../services/user';
import GroupChatApi from '../services/groupChat';

export default function () {
  const [ids, setIds] = useState([])
  const [open, setOpen] = useState(false)
  const { user } = useUser()
  const nameRef = useRef()
  const queryClient = useQueryClient()
  const [form] = Form.useForm()

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => UserApi.get({ q: {} }),
    initialData: []
  })

  const handleCreate = () => {
    GroupChatApi.create({
      name: nameRef.current.value,
      users: ids
    })
      .then(() => {
        queryClient.invalidateQueries(['groupchats', user._id])
        setOpen(false)
        setIds([])
      })
      .catch(err => toast(err.message, { type: 'error' }))
  }

  const onFinish = async (values) => {
    try {
      setOpen(false)
      setIds([])
    } catch (error) {
      toast(error.message, { type: 'error' })
    }
  }

  return <div>
    <Modal centered open={open} onCancel={() => setOpen(false)} title="Tạo nhóm chat" onOk={handleCreate} okText="Tạo">
      <Form form={form} onFinish={onFinish}>
        <Form.Item name="name" rules={[{ required: true, message: 'Vui lòng nhập tên nhóm' }]}>
          <Input label="Tên nhóm" inputRef={nameRef} />
        </Form.Item>
      </Form>
      {users.filter(e => e._id != user._id).map(e => {
        const isSelected = ids.includes(e._id)
        return (
          <div className="flex gap-5 items-center">
            <img src="https://social.webestica.com/assets/images/avatar/01.jpg" alt="" className="w-12 h-12 rounded-full" />
            <div className="font-semibold">{e.firstName} {e.lastName}</div>
            <div className="grow"></div>
            {
              isSelected ?
                <Button onClick={() => { setIds(ids.filter(t => t != e._id)) }}>Loại</Button> :
                <Button onClick={() => setIds([...ids, e._id])}>Thêm</Button>
            }
          </div>
        )
      })}
    </Modal>
    <Button size="small" className="!rounded-full" icon={<FaEdit />} color="primary" onClick={() => setOpen(true)} />
  </div>
}