import { Button } from "antd"
import { BsThreeDots } from "react-icons/bs"
import { IoCalendarNumberOutline, IoLocationOutline, IoPerson } from "react-icons/io5"
import { useQuery } from "react-query"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { FilePreview } from "../components"
import { GroupApi, GroupContext, Members } from '../features/group'
import { AttendEvent, CreateEvent, CreatePost, EventsWrapper, Posts } from '../features/post'
import { Tabs } from "antd"

function Events({ group, events, loadMore, hasMore }) {
  return <div className="flex flex-col gap-3">
    <div className="rounded-md bg-surface text-onSurface shadow overflow-hidden flex flex-col gap-3 p-5">
      <div className="justify-between flex">
        <div className="text-xl font-semibold">Discover Events</div>
        <CreateEvent data={{ group: group }} />
      </div>
      {
        events.map(e =>
          <div key={e._id} className="flex gap-5 items-center">
            <div className="w-20 h-20 rounded-md overflow-hidden" >
              <FilePreview id={e.cover} />
            </div>
            <div className="flex flex-col gap-2">
              <Link to={`/events/${e._id}`} className="text-xl font-semibold">{e.title}</Link>
              <div className="flex gap-1 items-center text-sm">
                <IoCalendarNumberOutline className="w-4 h-4" />
                <div>{e.time}</div>
                <IoLocationOutline className="w-4 h-4 ml-4" />
                <div>{e.location}</div>
                <IoPerson className="w-4 h-4 ml-4" />
                <div>{e.attendees.length} going</div>
              </div>
            </div>
            <div className="grow"></div>
            <div className="w-max"><AttendEvent event={e} /></div>
          </div>
        )
      }
      {hasMore && <Button onClick={loadMore} variant="outlined" color="primary">
        <div className="capitalize">Load more events</div>
      </Button>}
    </div>
  </div>
}

export default function () {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = useQuery({
    queryKey: ['group', id],
    queryFn: () => GroupApi.getById(id)
  })

  if (query.error || query.isLoading) return <></>

  const group = query.data

  return <GroupContext.Provider value={{ group: group }}>
    <div className="flex flex-col gap-3">

      <div className="rounded-md bg-surface text-onSurface overflow-hidden">
        <img src={group.avatar.url} className="w-full h-40 object-cover"></img>
        <div className="p-5 flex flex-col gap-5">
          <div className="flex gap-2 md:items-center justify-between max-md:flex-col">
            <div className="flex gap-2 items-center">
              <img src={group.avatar.url} className="w-20 h-20 rounded-full object-cover"></img>
              <div className="ml-5">
                <div className="text-xl font-semibold">{group.name}</div>
                <div className="flex gap-2 items-center">
                  <div className="">Private group</div>
                  <div className="">&#x2022;</div>
                  <div className="">2372 members</div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Button type="primary">Joined</Button>
              <Button>Invite</Button>
              <div className="grow"></div>
              <Button><BsThreeDots className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="flex gap-5 relative items-center">
            {
              new Array(5).fill(0).map((e, i) => <div className="h-8">
                <img className="w-8 h-8 absolute rounded-full border-2 border-surface object-cover" src={`https://social.webestica.com/assets/images/avatar/0${i + 1}.jpg`}></img>
              </div>)
            }
            <div className="h-8"><div className="w-8 h-8 absolute rounded-full border-2 border-surface bg-primary text-onPrimary text-[10px] text-center content-center">20+</div></div>
            <div className="ml-5 text-sm">Pmquy, Pmqafs and 20+ joined</div>
          </div>

        </div>
      </div>

      <Tabs
        defaultActiveKey={searchParams.get('tab') || 'posts'}
        onChange={(key) => setSearchParams({ tab: key })}
        items={[
          {
            label: 'Posts',
            key: 'posts',
            children:
              <div className="flex flex-col gap-5">
                <CreatePost />
                <Posts query={{ group: id }} />
              </div>
          },
          {
            label: 'About', key: 'about'

          },
          {
            label: 'Connections',
            key: 'connections',
            children: <Members id={id} />
          },
          { label: 'Media', key: 'media' },
          { label: 'Videos', key: 'files' },
          {
            label: 'Events',
            key: 'events',
            children: <EventsWrapper query={{ group: id }}><Events group={id} /></EventsWrapper>
          }
        ]}
      />
    </div>
  </GroupContext.Provider>
}