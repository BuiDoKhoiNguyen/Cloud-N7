import { useQuery } from 'react-query'
import api from '../services/api'
import { FriendCard } from './Friends'
import { Card } from 'antd'

export default function () {

  const query = useQuery({
    queryKey: ['suggest'],
    queryFn: () => api.getSuggested({ q: {} }),
    initialData: []
  })

  return <Card title='Gợi ý kết bạn'>
    <div className="grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-5">
      {query.data.map(e => <FriendCard _status='suggested' id={e._id} />)}
    </div>
  </Card>
}