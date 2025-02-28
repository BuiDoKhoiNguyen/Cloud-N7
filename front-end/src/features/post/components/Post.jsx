import { Modal, Skeleton } from "antd";
import { memo, useState } from "react";
import { MdArrowRight } from "react-icons/md";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { FilePreview } from "@/components"
import EventApi from "../services/EventApi";
import PostApi from "../services/PostApi";
import PostContext from "../store/PostContext";
import { CommentPost, CommentPostDetail } from "./CommentPost";
import Comments from "./Comments";
import CreateComment from "./CreateComment";
import { AttendEvent } from "./Event";
import { LikePost, LikePostDetail } from "./LikePost";
import Live from "./Live";
import SettingPost from "./SettingPost";
import { SharePost, SharePostDetail } from "./SharePost";
import { Vote } from "./Vote";
import { formatDate } from "@/utils";

function PostHeader({ post }) {
  return (
    <div className=" @container w-full">
      <div className="flex gap-2 @md:items-center @max-md:flex-col">
        <div className="flex gap-2 items-center">
          <img
            src={post.user.avatar.url}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="flex gap-2 font-semibold items-center">
              <Link to={`/users/${post.user._id}`} className="font-semibold">
                {post.user.firstName + " " + post.user.lastName}
              </Link>
              <div>&#x2022;</div>
              <div className="text-sm">{formatDate(post.createdAt, 'fromNow')}</div>
            </div>
            <div className="text-sm">Web Developer at Webestica</div>
          </div>
        </div>
        {post.group && <MdArrowRight className=" w-6 h-6 @max-md:hidden" />}
        {post.group && (
          <div className="flex gap-2 items-center">
            <img
              src={post.group.avatar.url}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <Link
                to={`/groups/${post.group._id}`}
                className="font-semibold"
              >
                {post.group.name}
              </Link>
              <div className="text-sm">Public group</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PostEmbed({ id }) {
  const query = useQuery({
    queryKey: ["post", id],
    queryFn: () => PostApi.getById(id),
  });
  if (query.isLoading || query.isError) return <></>;
  const post = query.data;
  return (
    <Link to={`/posts/${id}`} className="flex flex-col gap-3 border-2 border-gray-600  p-3">
      <PostHeader post={post} />
      {post.content && (
        <div className="whitespace-pre-line text-justify">{post.content}</div>
      )}
      {post.files?.length && (
        <div
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
          className="grid gap-2"
        >
          {post.files.map((e) => (
            <div className="w-full h-full rounded-md overflow-hidden" key={e}>
              <FilePreview id={e} />
            </div>
          ))}
        </div>
      )}
      {post.type === "Live" && <Live post={post} detail={true} />}
      {post.type === "Vote" && <Vote post={post} />}
    </Link>
  );
}

function EventEmbed({ id }) {
  const query = useQuery({
    queryKey: ["event", id],
    queryFn: () => EventApi.getById(id),
  });
  if (query.isLoading || query.isError) return <></>;
  const event = query.data;
  return (
    <Link to={`/events/${id}`} className={`flex flex-col gap-3 relative`}>
      <img
        src={event.cover.url}
        alt="cover"
        className="w-full h-72 object-cover rounded-md"
      />
      <div className="absolute flex gap-10 items-center bottom-0 left-0 right-0 p-5 bg-linear-to-b from-transparent to-black">
        <div className=" overflow-hidden grow text-white ">
          <div className="text-xl font-semibold text-ellipsis overflow-hidden text-nowrap">
            {event.title}
          </div>
          <div className="text-sm">{new Date(event.time).toLocaleString()}</div>
        </div>
        <div className="shrink-0">
          <AttendEvent event={event} />
        </div>
      </div>
    </Link>
  );
}

export function PostAction({ post }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex">
        <LikePostDetail post={post} />
        <div className="grow"></div>
        <CommentPostDetail post={post} />
        <SharePostDetail post={post} />
      </div>
      <div className="flex">
        <LikePost id={post._id} />
        <CommentPost id={post._id} />
        <div className="grow"></div>
        <SharePost
          id={post.ref?.id || post._id}
          type={post.ref?.type || "Post"}
        />
      </div>
    </div>
  );
}

export const Post = memo(function ({ id, isPopUp = false }) {
  const [open, setOpen] = useState(false);
  const query = useQuery({
    queryKey: ["post", id],
    queryFn: () => PostApi.getById(id),
  });

  if (query.isLoading || query.isError) return <Skeleton active />;

  const post = query.data;

  return (
    <PostContext.Provider
      value={{ setCreate: () => setOpen(true), post: post }}
    >
      {!isPopUp && (
        <Modal open={open} onCancel={() => setOpen(false)} footer={null} centered title={<PostHeader post={post} />}>
          <Post id={id} isPopUp={true} onClose={() => setOpen(false)} />
        </Modal>
      )}

      <div className="flex flex-col gap-3">

        {!isPopUp && <div className="flex justify-between items-center z-10">
          <PostHeader post={post} />
          <SettingPost post={post} />
        </div>}

        <div className="flex flex-col gap-3">
          <div className=" whitespace-pre-line text-justify">
            {post.content}
          </div>

          {post.ref && (
            <div className="">
              {post.ref.type === "Post" && <PostEmbed id={post.ref.id} />}
              {post.ref.type === "Event" && <EventEmbed id={post.ref.id} />}
            </div>
          )}

          {!!post.files.length && (
            <Link to={`/posts/${post._id}`}>
              <div
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                }}
                className="grid gap-2"
              >
                {post.files.map((e) => (
                  <div
                    className="w-full h-full rounded-md overflow-hidden"
                    key={e}
                  >
                    <FilePreview id={e} />
                  </div>
                ))}
              </div>
            </Link>
          )}

          {post.type === "Live" && (
            <Link to={`/posts/${post._id}`}>
              <Live post={post} detail={false} />
            </Link>
          )}

          {post.type === "Vote" && <Vote post={post} />}

          <hr />

          <PostAction post={post} />

          {isPopUp && (
            <div className="flex flex-col gap-3">
              <CreateComment />
              <Comments q={{ post: post._id, comment: "" }} />
            </div>
          )}
        </div>
      </div>
    </PostContext.Provider>
  );
});
