import { Button, Divider, IconButton, TextField } from "@mui/material";
import { useRef, useState } from "react";
import { IoMdHeart } from "react-icons/io";
import {
  IoBagCheck,
  IoBagOutline,
  IoCalendar,
  IoCalendarClearOutline,
  IoCalendarNumberOutline,
  IoHeartOutline,
  IoLocation,
  IoLocationOutline,
  IoPerson,
} from "react-icons/io5";
import {
  MdEdit,
  MdMessage,
  MdOutlineComment,
  MdPersonRemove,
  MdPhoneAndroid,
} from "react-icons/md";
import { useQuery } from "react-query";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { FilePreview } from "../components";
import { UserApi } from "../features/account";
import { CreateEvent, CreatePost, EventsWrapper, Posts } from "@/features/post";
import { useUser } from "../hooks/user";
import { getDiff } from "../utils/parseDate";

function Overview({ account, user, setUser }) {
  const ref = useRef();
  const isMe = user?._id == account._id;
  const [edit, setEdit] = useState(false);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("overview", ref.current.value);
    await UserApi.update(formData);
    setEdit(false);
  };

  return (
    <div className="rounded-md border-2 p-3 flex flex-col gap-3">
      <div className="justify-between flex">
        <div className="font-semibold">Overview</div>
        {isMe && (
          <IconButton onClick={() => setEdit(true)}>
            <MdEdit className="w-4 h-4" />
          </IconButton>
        )}
      </div>
      {edit ? (
        <TextField
          multiline
          fullWidth
          inputRef={ref}
          defaultValue={account.overview}
        />
      ) : account.overview ? (
        account.overview
      ) : (
        "No overview"
      )}

      {edit && (
        <div className="flex gap-2">
          <Button onClick={handleSave} variant="outlined" color="primary">
            Save
          </Button>
          <Button
            onClick={() => setEdit(false)}
            variant="outlined"
            color="error"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

function Wrapper({ account, user, setUser, data }) {
  const ref = useRef();
  const isMe = user?._id == account._id;
  const [edit, setEdit] = useState(false);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append(data.field, ref.current.value);
    await UserApi.update(formData);
    setEdit(false);
  };

  return (
    <div>
      {edit ? (
        <div className="flex flex-col gap-3">
          <TextField
            type={data.type}
            fullWidth
            inputRef={ref}
            defaultValue={account[data.field]}
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} variant="outlined" color="primary">
              Save
            </Button>
            <Button
              onClick={() => setEdit(false)}
              variant="outlined"
              color="error"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 items-center rounded-md border-2 py-1 px-3">
          {data.icon}
          <div>{data.title}:</div>
          <div className="font-semibold">
            {account[data.field] ? account[data.field] : "No"}
          </div>
          <div className="grow"></div>
          {isMe && (
            <IconButton onClick={() => setEdit(true)}>
              <MdEdit className="w-4 h-4" />
            </IconButton>
          )}
        </div>
      )}
    </div>
  );
}

export function Events({ events, loadMore, hasMore }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-md bg-surface text-onSurface shadow overflow-hidden flex flex-col gap-8 p-5">
        <div className="justify-between flex">
          <div className="text-xl font-semibold">Discover Events</div>
          <CreateEvent />
        </div>
        {events.map((e) => (
          <div key={e._id} className="flex gap-5 items-center">
            <div className="w-20 h-20 rounded-md overflow-hidden">
              <FilePreview id={e.cover} />
            </div>
            <div className="flex flex-col gap-2">
              <Link to={`/events/${e._id}`} className="text-xl font-semibold">
                {e.title}
              </Link>
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
            <IconButton>
              <MdEdit className="w-4 h-4" />
            </IconButton>
          </div>
        ))}
        {hasMore && (
          <Button onClick={loadMore} variant="outlined" color="primary">
            <div className="capitalize">Load more events</div>
          </Button>
        )}
      </div>
    </div>
  );
}

export default function () {
  const { user, setUser } = useUser();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useQuery({
    queryKey: ["user", id],
    queryFn: () => UserApi.getById(id),
  });

  if (query.isLoading || query.isError) return <></>;

  const account = query.data;

  return (
    <div className="flex gap-5 bg-background max-xl:px-12 max-lg:flex-col max-lg:px-0 px-32 py-5">
      <div className="flex flex-col gap-5 basis-2/3">
        <div className="rounded-md bg-surface text-onSurface shadow overflow-hidden">
          <img src={account.cover.url} className="h-48 w-full object-cover" />
          <div className="flex gap-5 items-end -translate-y-1/3 px-8">
            <img
              src={account.avatar.url}
              className="h-32 w-32 rounded-full border-2 object-cover"
            />
            <div>
              <div className="text-xl font-semibold">
                {account.firstName} {account.lastName}
              </div>
              <div>250 connections</div>
            </div>
            <div className="grow"></div>
            <Button variant="outlined" color="primary">
              Edit profile
            </Button>
            <Button variant="outlined" color="success">
              <MdEdit className="w-6 h-6" />
            </Button>
          </div>
          <div className="flex gap-5 px-8 pb-5">
            <div className="flex gap-2 items-center">
              <IoBagCheck className="w-6 h-6" />
              <div>Lead Developer</div>
            </div>
            <div className="flex gap-2 items-center">
              <IoLocation className="w-6 h-6" />
              <div>New Hampspire</div>
            </div>
            <div className="flex gap-2 items-center">
              <IoCalendar className="w-6 h-6" />
              <div>Joined on Nov 26, 2019</div>
            </div>
          </div>
          <Divider />
          <div className="flex gap-1 px-8 py-5 overflow-y-auto">
            {[
              "Posts",
              "About",
              "Connections",
              "Media",
              "Videos",
              "Events",
              "Activity",
            ].map((e) => (
              <div
                onClick={() => {
                  searchParams.set("q", e === "Posts" ? "" : e);
                  setSearchParams(searchParams);
                }}
                className={`font-semibold ${
                  searchParams.get("q") === e ||
                  (!searchParams.get("q") && e === "Posts")
                    ? "text-primary border-primary"
                    : "hover:text-primary/50 border-transparent"
                } px-4 pb-1 cursor-pointer border-b-2`}
              >
                {e}
              </div>
            ))}
          </div>
        </div>

        {!searchParams.get("q") && (
          <div className="flex flex-col gap-5">
            {user?._id == id && <CreatePost />}
            <Posts query={{ user: id }} />
          </div>
        )}

        {searchParams.get("q") === "About" && (
          <div className="flex flex-col gap-5">
            <div className="rounded-md bg-surface text-onSurface shadow overflow-hidden flex flex-col gap-5 p-5">
              <div className="text-xl font-semibold">Profile Info</div>
              <Overview account={account} user={user} setUser={setUser} />
              <div className="grid grid-cols-2 gap-5 items-start">
                {[
                  {
                    field: "birthday",
                    type: "date",
                    title: "Born",
                    icon: <IoCalendarNumberOutline className="w-6 h-6 my-1" />,
                  },
                  {
                    field: "status",
                    type: "text",
                    title: "Status",
                    icon: <IoHeartOutline className="w-6 h-6 my-1" />,
                  },
                  {
                    field: "phoneNumber",
                    type: "text",
                    title: "Phone",
                    icon: <MdPhoneAndroid className="w-6 h-6 my-1" />,
                  },
                  {
                    field: "occupation",
                    type: "text",
                    title: "Work",
                    icon: <IoBagOutline className="w-6 h-6 my-1" />,
                  },
                  {
                    field: "address",
                    type: "text",
                    title: "Lives in",
                    icon: <IoLocationOutline className="w-6 h-6 my-1" />,
                  },
                ].map((e, i) => (
                  <div key={i}>
                    <Wrapper
                      account={account}
                      user={user}
                      setUser={setUser}
                      data={e}
                    />
                  </div>
                ))}
                <div className="flex gap-2 items-center rounded-md border-2 py-1 px-3">
                  <IoCalendarClearOutline className="w-6 h-6 my-1" />
                  <div>Join on:</div>
                  <div className="font-semibold">
                    {new Date(account.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-md bg-surface text-onSurface shadow overflow-hidden flex flex-col gap-5 p-5">
              <div className="flex justify-between">
                <div className="text-xl font-semibold">Interests</div>
                <Button variant="outlined" color="primary">
                  <div className="capitalize">See all</div>
                </Button>
              </div>
              <div className="grid gap-5 grid-cols-3">
                {new Array(5)
                  .fill({
                    avatar: `https://social.webestica.com/assets/images/avatar/01.jpg`,
                    title: "Oracle",
                    followers: 250,
                  })
                  .map((e) => (
                    <div className="flex gap-5 items-center">
                      <img src={e.avatar} className="w-12 h-12 rounded-full" />
                      <div className="flex flex-col gap-2">
                        <div className="font-semibold">{e.title}</div>
                        <div>{e.followers} followers</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {searchParams.get("q") === "Connections" && (
          <div className="flex flex-col gap-5">
            <div className="rounded-md bg-surface text-onSurface shadow overflow-hidden flex flex-col gap-8 p-5">
              <div className="text-xl font-semibold">Connections</div>
              {new Array(5)
                .fill({
                  avatar: `https://social.webestica.com/assets/images/avatar/01.jpg`,
                  name: "John Doe",
                  title: "Lead Developer",
                })
                .map((e) => (
                  <div className="flex gap-5 items-end">
                    <img src={e.avatar} className="w-12 h-12 rounded-full" />
                    <div className="flex flex-col gap-2">
                      <div>
                        <div className="font-semibold">{e.name}</div> {e.title}
                      </div>
                      <div>250 connections</div>
                    </div>
                    <div className="grow"></div>
                    <Button variant="outlined" color="error">
                      <div className="capitalize">Remove</div>
                    </Button>
                    <Button variant="outlined" color="success">
                      <div className="capitalize">Message</div>
                    </Button>
                  </div>
                ))}
              <Button variant="outlined" color="primary">
                <div className="capitalize">Load more connections</div>
              </Button>
            </div>
          </div>
        )}

        {searchParams.get("q") === "Media" && (
          <div className="flex flex-col gap-5">
            <div className="rounded-md bg-surface text-onSurface shadow overflow-hidden flex flex-col gap-8 p-5">
              <div className="justify-between flex">
                <div className="text-xl font-semibold">Photos</div>
                <Button variant="outlined" color="primary">
                  <div className="capitalize">Create album</div>
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-5">
                {new Array(8)
                  .fill({
                    image: `https://social.webestica.com/assets/images/avatar/01.jpg`,
                    title: "Photo title",
                    post: "4398249823",
                  })
                  .map((e, i) => (
                    <div className="flex flex-col gap-2">
                      <img
                        src={e.image}
                        className="h-full object-cover rounded-md"
                      />
                      <div className="flex gap-1 items-center">
                        <IoMdHeart className="w-4 h-4" />
                        <div className="">22k</div>
                        <MdOutlineComment className="w-4 h-4 ml-4" />
                        <div className="">22k</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {searchParams.get("q") === "Videos" && (
          <div className="flex flex-col gap-5">
            <div className="rounded-md bg-surface text-onSurface shadow overflow-hidden flex flex-col gap-8 p-5">
              <div className="justify-between flex">
                <div className="text-xl font-semibold">Videos</div>
                <Button variant="outlined" color="primary">
                  <div className="capitalize">Create album</div>
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-5">
                {new Array(8)
                  .fill({
                    image: `https://social.webestica.com/assets/images/avatar/01.jpg`,
                    title: "Photo title",
                    post: "4398249823",
                  })
                  .map((e, i) => (
                    <div className="flex flex-col gap-2">
                      <img
                        src={e.image}
                        className="h-full object-cover rounded-md"
                      />
                      <div className="flex gap-1 items-center">
                        <IoMdHeart className="w-4 h-4" />
                        <div className="">22k</div>
                        <MdOutlineComment className="w-4 h-4 ml-4" />
                        <div className="">22k</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {searchParams.get("q") === "Events" && (
          <EventsWrapper>
            <Events />
          </EventsWrapper>
        )}

        {searchParams.get("q") === "Activity" && (
          <div className="flex flex-col gap-5">
            <div className="rounded-md bg-surface text-onSurface shadow overflow-hidden flex flex-col gap-8 p-5">
              <div className="text-xl font-semibold">Activity feed</div>
              {new Array(5)
                .fill({
                  title: "Comedy at the park",
                  createdAt: Date.now(),
                  image:
                    "https://social.webestica.com/assets/images/avatar/01.jpg",
                })
                .map((e) => (
                  <div className="flex gap-2 items-center">
                    <img src={e.image} className="w-12 h-12 rounded-full" />
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="font-semibold">{e.title}</div>
                    </div>
                    <div className="grow"></div>
                    {getDiff(e.createdAt)}
                  </div>
                ))}
              <Button variant="outlined" color="primary">
                <div className="capitalize">Load more activities</div>
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5 basis-1/3">
        <div className="rounded-md bg-surface text-onSurface shadow overflow-hidden flex flex-col gap-3 p-5">
          <div className="text-xl font-semibold">About</div>
          <div>{account.overview}</div>
          <div className="flex gap-2 items-center">
            <IoCalendarClearOutline className="w-6 h-6" />
            <div>Born:</div>
            <div className="font-semibold">
              {account.birthday ? account.birthday : "No"}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <IoHeartOutline className="w-6 h-6" />
            <div>Status:</div>
            <div className="font-semibold">
              {account.status ? account.status : "No"}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <MdPhoneAndroid className="w-6 h-6" />
            <div>Phone:</div>
            <div className="font-semibold">{account.phoneNumber}</div>
          </div>
        </div>
        <div className="rounded-md bg-surface text-onSurface shadow overflow-hidden flex flex-col gap-3 p-5">
          <div className="text-xl font-semibold">Experiences</div>
          {[
            {
              title: "Lead Developer",
              company: "Webestica",
              duration: "Nov 2019 - Present",
            },
            {
              title: "Junior Developer",
              company: "Webestica",
              duration: "Nov 2018 - Nov 2019",
            },
            {
              title: "Intern",
              company: "Webestica",
              duration: "Nov 2017 - Nov 2018",
            },
          ].map((e, i) => (
            <div className="flex gap-5 items-center">
              <img
                src={`https://social.webestica.com/assets/images/avatar/0${
                  i + 1
                }.jpg`}
                className="h-16 w-16 rounded-full"
              />
              <div className="flex flex-col gap-2">
                <div className="font-semibold">{e.company}</div>
                <div>
                  {e.duration} - {e.title}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-md bg-surface text-onSurface shadow overflow-hidden flex flex-col gap-3 p-5">
          <div className="flex justify-between">
            <div className="text-xl font-semibold">Photos</div>
            <Button variant="text" color="primary">
              <div className="capitalize">See all</div>
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 6, 32].map((e, i) => (
              <img
                src={`https://social.webestica.com/assets/images/avatar/0${
                  i + 1
                }.jpg`}
                className="h-full object-cover"
              />
            ))}
          </div>
        </div>
        <div className="rounded-md bg-surface text-onSurface shadow overflow-hidden flex flex-col gap-3 p-5">
          <div className="flex justify-between">
            <div className="text-xl font-semibold">Friends</div>
            <Button variant="text" color="primary">
              <div className="capitalize">See all</div>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {new Array(6).fill(0).map((e, i) => (
              <div className="rounded-md border-2 p-5 flex flex-col gap-1 items-center">
                <img
                  src={`https://social.webestica.com/assets/images/avatar/0${
                    i + 1
                  }.jpg`}
                  className="object-cover rounded-full w-2/3"
                />
                <div className="font-semibold">John Doe</div>
                <div className="flex">
                  <IconButton color="primary">
                    <MdMessage className="w-6 h-6" />
                  </IconButton>
                  <IconButton color="error">
                    <MdPersonRemove className="w-6 h-6" />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
