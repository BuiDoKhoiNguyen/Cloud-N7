import { useMemo, useRef } from "react"
import { useUser } from "../../../hooks/user"
import PostApi from "../services/PostApi"
import UserAccount from "../../../components/UserAccount"
import { Checkbox } from "@mui/material"

export function Vote({ post }) {
  const { user } = useUser()
  const total = useMemo(() => post.options.reduce((a, b) => a + b.votes.length, 0), [post.options])

  const handleVote = (checked, index) => {
    PostApi.voteById(post._id, { option: index, type: checked ? 'add' : 'remove' })
  }

  return <div className="flex flex-col gap-2">
    {post.options.map((e, i) => {

      const percentage = total ? Math.floor(e.votes.length * 100 / total) : 0
      const checked = e.votes.includes(user._id)

      return <div key={i} className="p-1 bg-background relative flex gap-5 items-center overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-primary/20" style={{ width: percentage + '%' }}></div>
        <div className="flex gap-1 items-center">
          <Checkbox onChange={(_, checked) => handleVote(checked, i)} defaultChecked={checked} />
          <div className="break-all heading">{e.content}</div>
        </div>
        <div className="grow"></div>
        <div onClick={e => console.log(e)} className="flex justify-end pointer-events-none">
          {e.votes.slice(0, 3).map((e, i) => <div key={i} ><UserAccount size="20px" id={e} displayName={false} /></div>)}
        </div>
        <div className="text-primary text-xss font-semibold shrink-0">{percentage}%</div>
      </div>
    })}
  </div>
}

export function VoteDetail({post}) {

}