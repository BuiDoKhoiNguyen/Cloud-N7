import { Divider } from "@mui/material";
import { IoLocationOutline } from "react-icons/io5";
import { TbUserPlus, TbUsers, TbWorld } from "react-icons/tb";
import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";
import { FilePreview } from "../components";
import MainNavBar from "../components/MainNavBar";
import { GroupAccount } from "../features/group";
import { AttendEvent, EventsWrapper, EventApi} from "../features/post";

function RelatedEvents({ events }) {
  return <div className="flex gap-3 flex-col">
    {events.map(e => <div key={e._id} className="flex gap-3 items-center">
      <div className="w-12 h-12 rounded-full overflow-hidden"><FilePreview id={e.cover} /></div>
      <div className="">
        <Link to={`/events/${e._id}`} className="heading">{e.title}</Link>
        <div className="flex text-sm items-center gap-1">
          <IoLocationOutline />
          <div>{e.location}</div>
        </div>
      </div>
      <div className="grow"></div>
      <div className="w-max">
        <AttendEvent event={e} />
      </div>
    </div>)}
  </div>
}

export default function Page() {
  const { id } = useParams()
  const query = useQuery({
    queryKey: ['event', id],
    queryFn: () => EventApi.getById(id)
  })
  if (!query.data) return <div></div>

  const event = query.data
  const date = new Date(event.time)

  return <div className="flex bg-background gap-5 py-5 sm:px-3 max-w-[1300px] mx-auto max-lg:flex-col">

    <div className="basis-1/4 shrink-0">
      <MainNavBar />
    </div>

    <div className="flex flex-col gap-5 grow">

      <div className="rounded-md overflow-hidden relative">
        <img src={event.cover.url} className="w-full h-72 object-cover" />
        <div className="absolute min-w-24 left-5 top-5 rounded-md bg-surface text-onSurface p-1">
          <div className="text-sm text-center bg-primary px-2 py-1 rounded-t-md text-onPrimary">{date.toLocaleDateString("en-US", { weekday: "long" })}</div>
          <div className="font-semibold p-1 text-center">{date.toLocaleDateString("en-US", { month: "short", day: "2-digit" })}</div>
        </div>
        <div className="absolute flex gap-10 items-center bottom-0 left-0 right-0 p-5 bg-linear-to-b from-transparent to-black">
          <div className=" text-white grow overflow-hidden">
            <div className="text-xl font-semibold text-ellipsis overflow-hidden text-nowrap">{event.title}</div>
            <div className="mt-2">https://themes.getbootstrap.com/store/webestica</div>
          </div>
          <div className="shrink-0 bg-white rounded-md">
            <AttendEvent event={event} />
          </div>
        </div>
      </div>

      <div className="card flex flex-col gap-5 @container">
        <div className="text-sm">{event.description}</div>
        <div className="grid gap-5 @xl:grid-cols-3 @md:grid-cols-2 grid-cols-1">
          <div>
            <div className="font-semibold text-xl heading">Timings</div>
            <div className="mt-3 text-sm">{date.toLocaleString()}</div>
          </div>

          <div>
            <div className="font-semibold text-xl heading">Location</div>
            <div className="mt-3 text-sm">{event.location}</div>
          </div>

          <div>
            <div className="font-semibold text-xl heading">Category & Type</div>
            <div className="mt-3 text-sm">{event.category}</div>
          </div>

          <div>
            <div className="font-semibold text-xl heading">Entry fees</div>
            <div className="mt-3 text-sm">Free Ticket For photography professionals check official website</div>
          </div>

          <div>
            <div className="font-semibold text-xl heading">Estimated turnout</div>
            <div className="mt-3 text-sm">140000 Visitors<br />1800 Exhibitors</div>
          </div>

          {event.group && <div>
            <div className="font-semibold text-xl heading mb-3">Group</div>
            <GroupAccount group={event.group} />
          </div>}
        </div>
        <Divider />
        <div className="flex gap-5 md:items-center justify-between max-md:flex-col">
          <div className="">
            <div className="heading text-xl font-semibold">Attendees</div>
            <div className="flex gap-5 relative items-center mt-3 ">
              {
                new Array(5).fill(0).map((e, i) => <div className="h-8">
                  <img className="w-8 h-8 absolute rounded-full border-2 border-surface object-cover" src={`https://social.webestica.com/assets/images/avatar/0${i + 1}.jpg`}></img>
                </div>)
              }
              <div className="ml-5 text-sm">148.9K people responded</div>
            </div>
          </div>
          <div className="flex gap-5">
            <div className="flex gap-4 items-center">
              <TbWorld className="w-6 h-6" />
              <div className="">
                <div className="font-semibold heading">125</div>
                <div className="text-sm">Vistors</div>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <TbUserPlus className="w-6 h-6" />
              <div className="">
                <div className="font-semibold heading">325</div>
                <div className="text-sm">Regsitors</div>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <TbUsers className="w-6 h-6" />
              <div className="">
                <div className="font-semibold heading">{event.attendees?.length}</div>
                <div className="text-sm">Attendance</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-5 max-md:flex-col">
        <div className="card flex flex-col basis-1/2">
          <div className="heading text-xl mb-8">Related events</div>
          <EventsWrapper><RelatedEvents /></EventsWrapper>
        </div>
        <div className="card basis-1/2">
          <div className="heading text-xl">Event location</div>
          <div className="flex text-sm items-center gap-2">
            <IoLocationOutline />
            <div>{event.location}</div>
          </div>
          <div className="mt-5 h-60 rounded-md overflow-hidden">
            <iframe src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3152.0000000000005!2d144.9631!3d-37.8136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad6429f64b2c9c5%3A0x130e0efb3f3d!2sFederation%20Square!5e0!3m2!1sen!2sau!4v1635736820004!5m2!1sen!2sau`} height={"100%"} width={"100%"} loading="lazy"></iframe>
          </div>
        </div>
      </div>

    </div>
  </div>
}