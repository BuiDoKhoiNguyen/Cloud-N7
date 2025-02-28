import { useQuery } from "react-query"
import { Link } from "react-router-dom"
import { UserApi } from '../features/account'

export default function UserAccount({ id, displayName = true, size = '32px' }) {
  const query = useQuery({
    queryKey: ['user', id],
    queryFn: () => UserApi.getById(id)
  })

  const user = query.data

  return <div className="w-max font-semibold">
    <Link to={'/users/' + id} className="flex gap-2 items-center">
      <img src={user?.avatar.url} className="rounded-full object-cover" style={{ width: size, height: size }} />
      {displayName && <div>{user?.firstName + " " + user?.lastName}</div>}
    </Link>
  </div>
}