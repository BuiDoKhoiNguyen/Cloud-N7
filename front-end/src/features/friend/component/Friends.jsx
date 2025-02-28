import { Button, Card } from "antd";
import { cloneElement, useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { useUser } from '../../../hooks/user';
import UserApi from '../../account/services/api';
import FriendApi from '../services/api';

export function FriendCard({ id, _status = "suggested" }) {
  const [status, setStatus] = useState(_status)
  const query = useQuery({
    queryKey: ['user', id],
    queryFn: () => UserApi.getById(id)
  })
  if (query.error || query.isLoading) return <></>
  const user = query.data

  const request = async () => {
    await FriendApi.create(id)
    setStatus("sending")
  }

  const accept = async () => {
    await FriendApi.accept(id)
    setStatus("accepted")
  }

  const reject = async () => {
    await FriendApi.reject(id)
    setStatus("rejected")
  }

  const cancel = async () => {
    await FriendApi.cancel(id)
    setStatus("suggested")
  }

  return <div className="rounded-md overflow-hidden border-2 flex flex-col gap-4">
    <div className="relative pb-8">
      <img className="w-full h-20 object-cover" src={user.cover.url}></img>
      <img className="w-16 h-16 rounded-full border-2 border-surface object-cover absolute -translate-y-1/2 left-1/2 -translate-x-1/2" src={user.avatar.url}></img>
    </div>

    <div className="text-center">
      <Link to={`/users/${id}`} className="font-semibold text-xl hover:text-primary">{user.firstName} {user.lastName}</Link>
      <div className=" text-sm">Public group</div>
    </div>

    <div className="flex gap-2 justify-center text-sm">
      <div className=" text-center basis-1/3"><div className="font-semibold">{1032}</div> Members</div>
      <div className="text-center basis-1/3"><div className="font-semibold">{429}</div> Posts per day</div>
    </div>

    <div className="flex gap-5 relative justify-center h-8">
      {
        new Array(5).fill(0).map((e, i) => <div>
          <img className="w-8 h-8 absolute rounded-full -translate-x-1/2 border-2 border-surface object-cover" src={`https://social.webestica.com/assets/images/avatar/0${i + 1}.jpg`}></img>
        </div>)
      }
    </div>


    <div className="p-3 border-t-2">
      <div className="flex items-center gap-2 justify-center flex-wrap">
        {status === "suggested" && <Button onClick={request} variant="outlined"><div className="text-sm capitalize">Kết bạn</div></Button>}
        {status === "sending" && <div>Đã gửi lời mời kết bạn</div>}
        {status === "sending" && <Button onClick={cancel} variant="outlined"><div className="text-sm capitalize">Thu hồi</div></Button>}
        {status === "accepted" && <div>Các bạn đã là bạn bè</div>}
        {status === "accepted" && <Button onClick={cancel} variant="outlined"><div className="text-sm capitalize">Hủy kết bạn</div></Button>}
        {status === "rejected" && <div>Đã xoá lời mời</div>}
        {status === "requested" && <Button onClick={accept} variant="outlined"><div className="text-sm capitalize">Chấp nhận</div></Button>}
        {status === "requested" && <Button onClick={reject} variant="outlined"><div className="text-sm capitalize">Từ chối</div></Button>}
      </div>
    </div>
  </div>
}

export function FriendsWrapper({ children, page = 0, limit = 10, query = {} }) {
  const [friends, setFriends] = useState([]);
  const hasMoreRef = useRef(false)
  const pageRef = useRef(page)

  const loadMore = async () => {
    if (hasMoreRef.current) {
      await FriendApi.get({ q: query }).then(e => {
        hasMoreRef.current = e.hasMore
        pageRef.current++
        setFriends(prev => [...prev, ...e.friends])
      })
    }
  }

  useEffect(() => {
    FriendApi.get({ q: query, page: page, limit: limit }).then(e => {
      hasMoreRef.current = e.hasMore
      pageRef.current = page + 1
      setFriends(e.friends)
    })
  }, [])

  return <div>
    {cloneElement(children, { friends, loadMore, hasMore: hasMoreRef.current })}
  </div>
}

function _Friends({ hasMore, loadMore, friends }) {
  const { user } = useUser()
  return <Card title="Bạn bè">
    <div className="grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-5">
      {friends.map(e => <FriendCard _status='accepted' id={user._id === e.sender ? e.receiver : e.sender} />)}
    </div>
  </Card>
}

function _Requested({ hasMore, loadMore, friends }) {
  return <Card title="Các yêu cầu">
    <div className="grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-5">
      {friends.map(e => <FriendCard _status='requested' id={e.sender} />)}
    </div>
  </Card>
}

function _Sending({ hasMore, loadMore, friends }) {
  return <Card title="Lời mời đã gửi đi">
    <div className="grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-5">
      {friends.map(e => <FriendCard _status='sending' id={e.receiver} />)}
    </div>
  </Card>
}

export function Friends() {
  return <FriendsWrapper query={{ status: 1 }}><_Friends /></FriendsWrapper>
}

export function Requested() {
  const { user } = useUser()
  return <FriendsWrapper query={{ status: 0, receiver: user._id }}><_Requested /></FriendsWrapper>
}

export function Sending() {
  const { user } = useUser()
  return <FriendsWrapper query={{ status: 0, sender: user._id }}><_Sending /></FriendsWrapper>
}
