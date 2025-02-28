import { useState } from "react"
import { FaCircleInfo } from "react-icons/fa6"
import { useQuery } from "react-query"
import api from '../services/groupChat'
import { Button } from "antd";
import { IoInformation } from "react-icons/io5";

export default function GroupInfo({ id }) {
  const [open, setOpen] = useState(false)
  const query = useQuery({
    queryKey: ['group', id],
    queryFn: () => api.getById(id)
  })

  return <div className=" relative">
    <Button size="small" type="primary" onClick={() => setOpen(!open)} icon={<IoInformation />} className="!rounded-full">
    </Button>
    <div className={`absolute right-0 ${open ? '' : ' translate-x-'}`}>

    </div>
  </div>
};
