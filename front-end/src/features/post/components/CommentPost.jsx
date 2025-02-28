import { Button } from "antd"
import { useContext } from "react"
import { FaComment, FaRegComment } from "react-icons/fa"
import PostContext from "../store/PostContext"

export function CommentPostDetail({ post }) {
  return <Button type="text" icon={<FaComment/>}>
    {post.comment_total}
  </Button>
}

export function CommentPost({ id }) {
  const { setCreate } = useContext(PostContext)
  return <Button onClick={setCreate} type="text" icon={<FaRegComment />}>
    <div className="text-sm font-semibold capitalize">Comment</div>
  </Button>
}