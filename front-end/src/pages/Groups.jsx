import { Button, Select, Tabs } from "antd";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { UserApi } from "../features/account";
import { CreateGroup, GroupApi } from "../features/group";
import { Posts } from "../features/post";


function GroupCard({ id }) {
  const query = useQuery({
    queryKey: ['group', id],
    queryFn: () => GroupApi.getById(id)
  })
  if (query.error || query.isLoading) return <></>
  const group = query.data

  return <div className="rounded-md overflow-hidden border-2 flex flex-col gap-4">
    <div className="relative pb-8">
      <img className="w-full h-20 object-cover" src={group.cover.url}></img>
      <img className="w-16 h-16 rounded-full border-2 border-surface object-cover absolute -translate-y-1/2 left-1/2 -translate-x-1/2" src={group.avatar.url}></img>
    </div>

    <div className="text-center">
      <Link to={`/groups/${id}`} className="font-semibold text-xl hover:text-primary">{group.name}</Link>
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
      <div className="mx-auto w-max">
        <Button variant="outlined">Join</Button>
      </div>
    </div>
  </div>
}

export default function Groups() {

  const [groups, setGroups] = useState([])

  useEffect(() => {
    UserApi.getGroups({}).then(res => {
      setGroups(res)
    })
  }, [])

  return <div className="flex flex-col gap-10">

    <div className="p-5 rounded-md shadow bg-surface text-onSurface flex flex-col gap-5">
      <div className="flex gap-5 items-center">
        <div className="font-semibold text-xl">Group</div>
        <div className="grow"></div>
        <Select placeholder="Sort by" options={[
          { value: 'Alphabetical', label: 'Alphabetical' },
          { value: 'Most members', label: 'Most members' },
          { value: 'Newest group', label: 'Newest group' },
          { value: 'Recently active', label: 'Recently active' }
        ]}>
        </Select>
        <CreateGroup />
      </div>
      <Tabs items={['Joined groups', `Friends's groups`, 'Suggested for you', 'Popular near you',].map(e => ({
        key: e,
        label: <div className="text-sm font-semibold">{e}</div>,
      }))} />
      <div className="grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-5">
        {groups.map(e => <div key={e}><GroupCard id={e} /> </div>)}
      </div>
      <Button >View more</Button>
    </div>

    <div className="p-5 rounded-md shadow bg-surface text-onSurface flex flex-col gap-5">
      <div className="flex gap-5 items-center">
        <div className="font-semibold text-xl">Post</div>
        <div className="grow"></div>
        <Select placeholder="Sort by" options={[
          { value: 'Latest', label: 'Latest' },
          { value: 'Most liked', label: 'Most liked' },
          { value: 'Most commented', label: 'Most commented' },
          { value: 'Most shared', label: 'Most shared' }
        ]}>
        </Select>
      </div>
    </div>
    <Posts api={GroupApi.getPosts} />
  </div>
}