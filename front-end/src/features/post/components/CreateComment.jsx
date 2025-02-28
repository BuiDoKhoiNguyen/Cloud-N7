import { Button, Form, Input } from "antd";
import { useContext, useState } from "react";
import { IoMdSend } from "react-icons/io";
import { MdCancel } from "react-icons/md";
import { useQueryClient } from "react-query";
import { toast } from "react-toastify";
import Upload from "../../../components/Upload";
import UserAccount from "../../../components/UserAccount";
import { useUser } from "../../../hooks/user";
import CommentApi from "../services/CommentApi";
import CommentContext from "../store/CommentContext";
import PostContext from "../store/PostContext";

export default function () {
  const { user } = useUser();
  const commentContext = useContext(CommentContext);
  const postContext = useContext(PostContext);
  const [files, setFiles] = useState([]);
  const queryClient = useQueryClient();

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      values.content && formData.append("content", values.content);
      formData.append("post", postContext.post._id);
      if (commentContext) formData.append("comment", commentContext.comment._id);
      files.forEach((file) => formData.append("files", file));
      await CommentApi.create(formData);
      setFiles([]);
      if (commentContext) commentContext.setCreate(false);
      queryClient.invalidateQueries([
        "comments",
        {
          comment: commentContext ? commentContext.comment._id : "",
          post: postContext.post._id,
        },
      ]);
    } catch (error) {
      toast(error.message, { type: "error" });
    }
  }

  return (
    <div className={`flex relative gap-2`}>
      <UserAccount displayName={false} id={user._id} />
      <div className="rounded-lg bg-background text-onBackground grow py-2 px-3">
        <Form onFinish={onFinish} className="flex flex-col gap-3">
          <Form.Item name="content" className="w-full" noStyle>
            <Input.TextArea
              placeholder="Viết bình luận"
              variant="borderless"
              autoSize={{ minRows: 1, maxRows: 5 }}
            />
          </Form.Item>
          <div className="flex gap-5 justify-between items-center">
            <div className="max-w-96">
              <Upload files={files} setFiles={setFiles} />
            </div>
            <div className="flex gap-5">
              <Form.Item noStyle>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="flex items-center gap-2"
                >
                  <IoMdSend />
                  Gửi
                </Button>
              </Form.Item>
              {(commentContext?.create || postContext?.create) && (
                <MdCancel
                  onClick={() => {
                    if (commentContext) commentContext.setCreate(false);
                    else postContext.setCreate(false);
                  }}
                  className=" w-6 h-6 bg-primary text-onPrimary hover:bg-secondary btn rounded-lg p-1"
                />
              )}
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
