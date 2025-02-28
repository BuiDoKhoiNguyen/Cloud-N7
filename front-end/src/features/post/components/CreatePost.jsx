import { Chip, IconButton } from "@mui/material";
import { Button, Form, Modal, Input, Upload as AntdUpload } from "antd";
import { useContext, useRef, useState } from "react";
import {
  MdAdd,
  MdClose,
  MdForum,
  MdImage,
  MdInbox,
  MdVideoCall,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Upload from "../../../components/Upload";
import { useUser } from "../../../hooks/user";
import { GroupContext } from "../../group";
import PostApi from "../services/PostApi";

function NormalPost() {
  const [files, setFiles] = useState([]);

  return (
    <div className="flex flex-col gap-3">
      <Form.Item name={"content"} noStyle>
        <Input placeholder="Viết nội dung" />
      </Form.Item>
      <Form.Item name={"files"} noStyle>
        <AntdUpload.Dragger
          defaultFileList={[]}
          name="files"
          accept="image/*,video/*,audio/*,application/pdf"
          beforeUpload={(file) => {
            setFiles((prev) => [...prev, file]);
            return false;
          }}
          onRemove={(file) => {
            setFiles((prev) => prev.filter((e) => e.name !== file.name));
          }}
        >
          <p className="ant-upload-drag-icon">
            <MdInbox />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for a single or bulk upload. Strictly prohibited from
            uploading company data or other banned files.
          </p>
        </AntdUpload.Dragger>
      </Form.Item>
      <Upload files={files} setFiles={setFiles} />
    </div>
  );
}

function LivePost() {
  return (
    <div className="flex flex-col gap-5">
      <Form.Item name={"content"} noStyle>
        <Input placeholder={"Tiêu đề buổi live"} />
      </Form.Item>
    </div>
  );
}

function VotePost() {
  const [files, setFiles] = useState([]);

  return (
    <div className="flex flex-col gap-5">
      <Form.Item name={"content"} noStyle>
        <Input placeholder="Viết nội dung" />
      </Form.Item>

      <Form.List
        name="options"
        noStyle
        rules={[
          { required: true, message: "Vui lòng nhập ít nhất một lựa chọn" },
        ]}
      >
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map((field) => (
              <div className="flex gap-2" key={field.key}>
                <Form.Item
                  name={[field.name, "content"]}
                  rules={[
                    { required: true, message: "Vui lòng nhập lựa chọn" },
                  ]}
                  noStyle
                >
                  <Input placeholder="Nhập lựa chọn" />
                </Form.Item>
                <Button
                  danger
                  icon={<MdClose />}
                  onClick={() => remove(field.name)}
                />
              </div>
            ))}

            <Form.Item noStyle>
              <Button type="primary" onClick={() => add()} icon={<MdAdd />}>
                Thêm lựa chọn
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Upload files={files} setFiles={setFiles} />
    </div>
  );
}

export default function CreatePost() {
  const { user } = useUser();
  const [form] = Form.useForm();
  const groupContext = useContext(GroupContext);
  const [type, setType] = useState();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      formData.append("type", type);
      groupContext && formData.append("group", groupContext.group._id);
      values.content && formData.append("content", values.content);
      values.files &&
        values.files.fileList.forEach((file) =>
          formData.append("files", file.originFileObj)
        );
      values.options &&
        values.options.forEach((e, i) =>
          formData.append(`options[${i}][content]`, e.content)
        );
      const res = await PostApi.create(formData);
      setType(null);
      if (res.type === "Live") navigate(`/posts/${res._id}`);
    } catch (error) {
      toast(error.message, { type: "error" });
    }
  };

  return (
    <>
      <Modal
        onOk={() => form.submit()}
        open={!!type}
        onCancel={() => setType(null)}
        okText="Đăng"
        cancelText="Hủy"
      >
        <Form onFinish={onFinish} form={form} className="flex flex-col gap-3">
          <div className="flex gap-2 items-center">
            <img
              className={"w-8 h-8 overflow-hidden rounded-full object-cover"}
              src={user.avatar.url}
            />
            <div className="font-semibold">
              {user.firstName} {user.lastName}
            </div>
          </div>
          {type === "Normal" && <NormalPost />}
          {type === "Live" && <LivePost />}
          {type === "Vote" && <VotePost />}
        </Form>
      </Modal>

      <div className="flex flex-col gap-10 rounded-md p-5 bg-surface text-onSurface shadow">
        <div className="flex gap-5 items-center">
          <img
            className={"w-8 h-8 overflow-hidden rounded-full object-cover"}
            src={user.avatar.url}
          />
          <div
            className="bg-background grow py-2 px-5 cursor-pointer select-none rounded-3xl text-onBackground active:bg-background/70"
            onClick={() => setType("Normal")}
          >
            Share your thoughts...
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setType("Live")}
            icon={<MdVideoCall color="#dc2626" />}
          >
            Trực tiếp
          </Button>
          <Button
            onClick={() => setType("Normal")}
            icon={<MdImage color="#2563eb" />}
          >
            Hình ảnh/Video
          </Button>
          <Button
            onClick={() => setType("Vote")}
            icon={<MdForum color="#16a34a" />}
          >
            Bình chọn
          </Button>
        </div>
      </div>
    </>
  );
}
