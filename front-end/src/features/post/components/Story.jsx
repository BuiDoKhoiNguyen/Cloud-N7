import { Link } from "react-router-dom";
import { FilePreview } from "../../../components";

import { Button, Form, Input, Modal, Upload } from "antd";
import { cloneElement, useEffect, useRef, useState } from "react";
import { FaFileAlt } from "react-icons/fa";
import { MdAdd, MdInbox } from "react-icons/md";
import { useUser } from "../../../hooks/user";
import StoryApi from "../services/StoryApi";

export function StoryWrapper({ children }) {
  const [stories, setStories] = useState([]);
  const hasMoreRef = useRef(true);

  const loadMore = async () => {
    await StoryApi.get({}).then((e) => setStories((prev) => [...prev, ...e]));
    hasMoreRef.current = false;
  };

  useEffect(() => {
    StoryApi.get({}).then(setStories);
    hasMoreRef.current = true;
  }, []);

  return (
    <div>
      {cloneElement(children, {
        stories,
        loadMore,
        hasMore: hasMoreRef.current,
      })}
    </div>
  );
}

export function CreateStory() {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const [form] = Form.useForm();
  const [files, setFiles] = useState([]);

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      values.content && formData.append("content", values.content);
      files.forEach((e) => formData.append("files", e));
      await StoryApi.create(formData);
      setOpen(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="">
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        okText="Đăng"
        onOk={() => form.submit()}
        cancelText="Hủy"
      >
        <Form form={form} onFinish={onFinish} className="flex flex-col gap-3">
          <div className="flex gap-2 items-center">
            <img
              className={"w-8 h-8 overflow-hidden rounded-full object-cover"}
              src={user.avatar.url}
            />
            <div className="font-semibold">
              {user.firstName} {user.lastName}
            </div>
          </div>
          <Form.Item name="content">
            <Input placeholder={"Viết nội dung"} multiline />
          </Form.Item>

          <Form.Item name="files" className=" self-center">
            <Upload.Dragger
              defaultFileList={[]}
              name="files"
              accept="image/*,video/*,audio/*,application/pdf"
              beforeUpload={(file) => {
                setFiles((prev) => [...prev, file]);
                return false; // Prevent automatic upload
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
            </Upload.Dragger>
          </Form.Item>
        </Form>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-5">
          {files.map((e, i) => {
            const type = e.type.split("/")[0];
            return (
              <div key={i} className=" relative rounded-md overflow-hidden">
                {type == "image" ? (
                  <img
                    className="object-cover"
                    key={e}
                    src={URL.createObjectURL(e)}
                  />
                ) : type == "video" ? (
                  <video key={i} src={URL.createObjectURL(e)} controls={true} />
                ) : (
                  <div className="flex flex-col items-center">
                    <FaFileAlt className="w-8 h-8" />
                    <div>{e.name}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Modal>
      <Button variant="outlined" type="text"  onClick={() => setOpen(true)}>
        <MdAdd size={24} />
      </Button>
    </div>
  );
}

function _Stories({ stories, loadMore }) {
  return (
    <div className="flex gap-2 p-5 bg-surface text-onSurface rounded-md shadow">
      <div className="flex shrink-0 flex-col gap-2 items-center w-32 h-44 border-2 border-dashed border-primary rounded-lg justify-center">
        <CreateStory />
        <div className="text-sm">Post a story</div>
      </div>
      <div className="flex gap-2 overflow-y-auto pb-2">
        {stories.map((e) => (
          <Link
            key={e._id}
            to={"/stories"}
            className="shrink-0 relative overflow-hidden rounded-lg"
          >
            <div className="w-32 h-44 object-cover">
              <FilePreview id={e.files[0]} />
            </div>
            <div className="right-0 h-1/2 absolute bottom-0 left-0 bg-linear-180 from-transparent to-black"></div>
            <div className="absolute bottom-2 left-0 right-0 text-xs text-center text-white">
              {e.user.firstName} {e.user.lastName}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Stories() {
  return (
    <StoryWrapper>
      <_Stories />
    </StoryWrapper>
  );
}
