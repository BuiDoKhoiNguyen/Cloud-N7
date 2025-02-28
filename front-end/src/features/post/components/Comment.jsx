import { Button, Skeleton } from "antd";
import { memo, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { FilePreview } from "../../../components";
import { useUser } from "../../../hooks/user";
import { getDiff } from "../../../utils/parseDate";
import CommentApi from '../services/CommentApi';
import CommentContext from '../store/CommentContext';
import Comments from './Comments';
import CreateComment from './CreateComment';
import { LikeComment, LikeCommentDetail } from "./LikeComment";
import UpdateComment from "./UpdateComment";
import { formatDate } from "@/utils";

export default memo(function ({ id }) {
  const { user } = useUser()
  const [create, setCreate] = useState(false)
  const [update, setUpdate] = useState(false)
  const [open, setOpen] = useState(false)

  const query = useQuery({
    queryKey: ['comment', id],
    queryFn: () => CommentApi.getById(id)
  })

  if (query.isLoading || query.isError) return <Skeleton active className="w-full h-16" />;

  const comment = query.data

  return <CommentContext.Provider value={{ setCreate: setCreate, setUpdate: setUpdate, comment: comment }}>
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <img src={comment.user.avatar.url} alt="avatar" className="w-8 h-8 object-cover rounded-full" />
        {update ?
          <div className=""><UpdateComment /></div> :
          <div className="flex flex-col gap-2 w-max">
            <div className="flex gap-2 items-center">
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 font-semibold items-center">
                  <Link to={`/users/${comment.user._id}`}>{comment.user.firstName + ' ' + comment.user.lastName}</Link>
                  <div>&#x2022;</div>
                  <div className="text-xs">{formatDate(comment.createdAt, "fromNow")}</div>
                </div>
                {comment.content && <div className="bg-background text-onBackground p-2 rounded-e-md rounded-b-md whitespace-pre-line">{comment.content}</div>}
                {comment.files.map(e => <Link to={`/files/${e}`} className="max-w-60 rounded-md overflow-hidden" key={e}><FilePreview id={e} /></Link>)}
              </div>
              <div className="relative btn">
                <BsThreeDots onClick={() => setOpen(prev => !prev)} className="w-6 h-6 hover:bg-background p-1 rounded-full" />
                {open && <div className="absolute left-8 w-max bg-surface shadow text-onSurface top-0 font-semibold flex flex-col">
                  <div className="p-2 hover:bg-background">Ẩn bình luận</div>
                  {comment.user == user._id && <button className="p-2 hover:bg-background">Xoá</button>}
                  {comment.user == user._id && <button className="p-2 hover:bg-background" onClick={() => setUpdate(true)}>Chỉnh sửa</button>}
                </div>}
              </div>
            </div>
            <div className="flex items-center">
              <LikeComment id={comment._id} />
              <Button type="text" onClick={() => setCreate(true)} ><div className="text-sm capitalize font-semibold">Reply</div></Button>
              <LikeCommentDetail id={comment._id} />
            </div>
          </div>}
      </div>
      {create && <div className="pl-10"><CreateComment /></div>}
      <div className="pl-10"><Comments q={{ comment: comment._id, post: comment.post }} limit={2} /></div>
    </div>
  </CommentContext.Provider>
})