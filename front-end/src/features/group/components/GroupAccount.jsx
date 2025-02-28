import { Link } from "react-router-dom"

export default function ({ group, detail = true, }) {

  return <div>
    <Link to={'/groups/' + group._id} className="flex gap-2 items-center">
      <img src={group.avatar.url} className="w-10 h-10 rounded-full overflow-hidden"></img>
      {detail && <div className="">
        <div className="font-semibold">{group.name}</div>
        <div className="text-sm">Public group</div>
      </div>}
    </Link>
  </div>
}