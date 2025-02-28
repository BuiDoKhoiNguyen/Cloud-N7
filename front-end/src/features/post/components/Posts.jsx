import { useMutation } from 'react-query'
import PostApi from '../services/PostApi'
import {Post} from './Post'
import { useEffect, useRef, useState } from 'react'

const LIMIT = 3

export default function Posts({query = {}, api = PostApi.get}) {
  const hasMoreRef = useRef(true)
  const pageRef = useRef(0)
  const [posts, setPosts] = useState([])
  const loadingRef = useRef()

  const mutation = useMutation({
    mutationFn: () => api({ page: pageRef.current, limit: LIMIT, q: query }),
    onSuccess: data => {
      hasMoreRef.current = data.hasMore
      pageRef.current += 1
      setPosts(prev => [...prev, ...data.posts])
    }
  })

  useEffect(() => {
    pageRef.current = 0
    hasMoreRef.current = true
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && hasMoreRef.current) mutation.mutate()
      })
    }, {
      rootMargin: '200px'
    })
    if (loadingRef.current) observer.observe(loadingRef.current)

    return () => {
      if (loadingRef.current) observer.unobserve(loadingRef.current)
      observer.disconnect()
    }
  }, [])

  return <div className='flex flex-col gap-5'>
    {posts.length === 0 && <div className='text-center font-semibold'>No posts</div>}
    {posts.map(e => <div key={e._id} className='bg-surface text-onSurface shadow rounded-md p-5'><Post id={e._id} /></div>)}
    <div ref={loadingRef}></div>
  </div>
}