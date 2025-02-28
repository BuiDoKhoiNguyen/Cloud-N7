import { Button, Divider } from "antd";
import { useState } from "react";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";
import { FileDetail } from "../components";
import MainNavBar from "../components/MainNavBar";
import { GroupAccount } from "../features/group";
import { Comments, Live, PostAction, PostApi, PostContext, Vote } from "../features/post";
import CreateComment from "../features/post/components/CreateComment";
import { getDiff } from "../utils/parseDate";

export default function Post() {
  const params = useParams()
  const [index, setIndex] = useState(0)
  const id = params.id
  const query = useQuery({
    queryKey: ['post', id],
    queryFn: () => PostApi.getById(id)
  })
  if (query.isLoading || query.isError) return <></>
  const post = query.data

  return <div className="flex bg-background gap-5 sm:px-3 py-5 max-w-[1300px] mx-auto max-lg:flex-col">

    <div className="basis-1/4">
      <MainNavBar />
    </div>

    <div className="basis-3/4 overflow-hidden">
      <PostContext.Provider value={{ post: post }}>
        <div className="flex flex-col gap-5 relative card">
          <div className="text-sm">Ngày đăng: {new Date(post.createdAt).toLocaleString()}</div>
          {post.content && <div className=" whitespace-pre-line text-justify heading">{post.content}</div>}

          {!!post.files.length && <div className="relative rounded-md overflow-hidden">
            <Link to={`/files/${post.files[index]}`}><FileDetail id={post.files[index]} /></Link>
            <div className="absolute left-5 top-1/2 -translate-y-1/2">
              <Button disabled={index === 0} variant="contained" onClick={() => setIndex((index - 1 + post.files.length) % post.files.length)}>
                <IoMdArrowDropleft className="w-6 h-6" />
              </Button>
            </div>

            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <Button disabled={index === post.files.length - 1} variant="contained" onClick={() => setIndex((index + 1) % post.files.length)}>
                <IoMdArrowDropright className="w-6 h-6" />
              </Button>
            </div>
          </div>}

          {post.type == 'Live' && <div><Live post={post} /></div>}

          <div className="flex gap-2 items-center flex-wrap">
            <img src={post.user.avatar.url} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <div className="flex gap-2 font-semibold items-center">
                <Link to={`/users/${post.user._id}`}>{post.user.firstName + ' ' + post.user.lastName}</Link>
                <div>&#x2022;</div>
                <div className="text-sm">{getDiff(post.createdAt)}</div>
              </div>
              <div className="text-sm">Web Developer at Webestica</div>
            </div>
            {post.group && <IoMdArrowDropright className=" w-6 h-6" />}
            {post.group && <GroupAccount group={post.group} />}
          </div>
          {post.type == 'Vote' && <div className=""><Vote post={post} /></div>}
          <Divider/>
          <PostAction post={post} />
          <CreateComment />
          <Comments q={{ post: id, comment: "" }} />

        </div>
      </PostContext.Provider>
    </div>

  </div>
};
