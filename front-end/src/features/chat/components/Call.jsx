import { Card, Dialog, Divider, IconButton, Tooltip } from "@mui/material"
import { Button } from "antd"
import { useEffect, useRef, useState } from "react"
import { FaMicrophone } from "react-icons/fa"
import { MdVideoCall } from "react-icons/md"
import { PiScreencastBold, PiVideoCameraFill } from "react-icons/pi"
import { BsCopy, BsThreeDots } from "react-icons/bs"
import { useQuery } from 'react-query'
import { toast } from 'react-toastify'
import { useSocket } from "../../../hooks/socket"
import { useUser } from "../../../hooks/user"
import api from '../services/message'
import CreateMessage from "./CreateMessage"
import Messages from "./Messages"

const servers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun.l.google.com:5349" },
    { urls: "stun:stun1.l.google.com:3478" },
    { urls: "stun:stun1.l.google.com:5349" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:5349" },
    { urls: "stun:stun3.l.google.com:3478" },
    { urls: "stun:stun3.l.google.com:5349" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:5349" },
    {
      urls: "stun:stun.relay.metered.ca:80",
    },
    {
      urls: "turn:standard.relay.metered.ca:80",
      username: "5177322f9615b2eb2249488c",
      credential: "k1G5No+LjyPmRKK4",
    },
    {
      urls: "turn:standard.relay.metered.ca:80?transport=tcp",
      username: "5177322f9615b2eb2249488c",
      credential: "k1G5No+LjyPmRKK4",
    },
    {
      urls: "turn:standard.relay.metered.ca:443",
      username: "5177322f9615b2eb2249488c",
      credential: "k1G5No+LjyPmRKK4",
    },
    {
      urls: "turns:standard.relay.metered.ca:443?transport=tcp",
      username: "5177322f9615b2eb2249488c",
      credential: "k1G5No+LjyPmRKK4",
    },
  ],
}

function Call({ id, setOpen }) {
  const { user } = useUser()
  const { socket } = useSocket()
  const streamRef = useRef(), mainVideoRef = useRef(), myVideoRef = useRef(), ref = useRef(), othersRef = useRef({})
  const [others, setOthers] = useState({})
  const [currentOther, setCurrentOther] = useState()
  const [isSharing, setIsSharing] = useState(false)
  const [withVideo, setWithVideo] = useState(true)
  const [withAudio, setWithAudio] = useState(true)

  useEffect(() => {
    let listener

    console.log('call')

    const solve = async () => {
      myVideoRef.current.srcObject = mainVideoRef.current.srcObject = streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })

      socket.emit('call', JSON.stringify({ type: 'join', user: user._id, displayName: user.firstName + ' ' + user.lastName, group: 'call' + id }))

      listener = async payload => {
        payload = JSON.parse(payload)
        switch (payload.type) {
          case 'join': {
            if (othersRef.current[payload.user]) break
            const pc = new RTCPeerConnection(servers)
            const remoteStream = new MediaStream()
            othersRef.current[payload.user] = { pc: pc, stream: remoteStream, user: payload.displayName }
            streamRef.current.getTracks().forEach(track => pc.addTrack(track, streamRef.current))
            pc.ontrack = event => event.streams[0] && event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track))
            pc.onicecandidate = event => event.candidate && socket.emit('call', JSON.stringify({ type: 'ice', group: 'call' + id, user: user._id, data: event.candidate, to: payload.user }))
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            socket.emit('call', JSON.stringify({ type: 'offer', group: 'call' + id, user: user._id, displayName: user.firstName + ' ' + user.lastName, data: offer, to: payload.user }))
            break
          }
          case 'offer': {
            if (payload.to != user._id || othersRef.current[payload.user]) break
            const pc = new RTCPeerConnection(servers)
            const remoteStream = new MediaStream()
            othersRef.current[payload.user] = { pc: pc, stream: remoteStream, user: payload.displayName }
            streamRef.current.getTracks().forEach(track => pc.addTrack(track, streamRef.current))
            pc.ontrack = event => event.streams[0] && event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track))
            pc.onicecandidate = event => event.candidate && socket.emit('call', JSON.stringify({ type: 'ice', group: 'call' + id, user: user._id, data: event.candidate, to: payload.user }))
            await pc.setRemoteDescription(new RTCSessionDescription(payload.data))
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)
            socket.emit('call', JSON.stringify({ type: 'answer', group: 'call' + id, user: user._id, data: answer, to: payload.user }))
            setOthers({ ...othersRef.current })
            break
          }
          case 'answer': {
            if (payload.to != user._id || !othersRef.current[payload.user]) break
            othersRef.current[payload.user].pc.setRemoteDescription(new RTCSessionDescription(payload.data))
            setOthers({ ...othersRef.current })
            break
          }
          case 'ice': {
            if (user._id != payload.to || !othersRef.current[payload.user]) break
            othersRef.current[payload.user].pc.addIceCandidate(new RTCIceCandidate(payload.data))
            break
          }
          case 'leave': {
            delete othersRef.current[payload.user]
            setOthers({ ...othersRef.current })
            break
          }
        }
      }

      socket.on('call', listener)

    }

    solve()

    return () => {
      console.log('leave')
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(e => e.stop())
      }
      othersRef.current = {}
      socket.emit('call', JSON.stringify({ type: 'leave', user: user._id, group: 'call' + id }))
      socket.off('call', listener)
    }
  }, [id])

  useEffect(() => {
    const a = Object.keys(others)
    a.forEach((e, i) => ref.current.childNodes[i + 1].childNodes[0].srcObject = others[e].stream)
  }, [others, id])

  const handleShareScreen = async () => {
    try {
      streamRef.current.getVideoTracks()[0].stop()
      streamRef.current.removeTrack(streamRef.current.getVideoTracks()[0])
      const stream = isSharing ? await navigator.mediaDevices.getUserMedia({ video: true }) : await navigator.mediaDevices.getDisplayMedia({ video: true })
      const videoTrack = stream.getTracks()[0]
      streamRef.current.addTrack(videoTrack)
      Object.keys(others).forEach(peerId => {
        const pc = others[peerId].pc
        let videoSender = pc.getSenders().find(sender => sender.track?.kind === 'video')
        if (videoSender) videoSender.replaceTrack(videoTrack)
      })
      setIsSharing(!isSharing)

    } catch (error) {
      toast(error.message, { type: 'error' })
    }
  }

  const handleWithAudio = async () => {
    try {
      if (withAudio) {
        Object.keys(others).forEach(peerId => {
          const pc = others[peerId].pc
          let sender = pc.getSenders().find(sender => sender.track?.kind === 'audio')
          if (sender?.track) sender.track.enabled = false
        })
      } else {
        Object.keys(others).forEach(peerId => {
          const pc = others[peerId].pc
          let sender = pc.getSenders().find(sender => sender.track?.kind === 'audio')
          if (sender?.track) sender.track.enabled = true
        })
      }
      setWithAudio(!withAudio)

    } catch (error) {
      toast(error.message, { type: 'error' })
    }
  }

  const handleWithVideo = async () => {
    try {
      if (withVideo) {
        Object.keys(others).forEach(peerId => {
          const pc = others[peerId].pc
          let sender = pc.getSenders().find(sender => sender.track?.kind === 'video')
          if (sender?.track) sender.track.enabled = false
        })
      } else {
        Object.keys(others).forEach(peerId => {
          const pc = others[peerId].pc
          let sender = pc.getSenders().find(sender => sender.track?.kind === 'video')
          if (sender?.track) sender.track.enabled = true
        })
      }
      setWithVideo(!withVideo)

    } catch (error) {
      toast(err.message, { type: 'error' })
    }
  }

  const handleClose = () => {
    if (Object.keys(others).length == 0) {
      const data = new FormData()
      data.append('status', 'ended')
      api.updateById(query.data[query.data.length - 1]._id, data)
        .then(() => setOpen(false))
        .catch(err => toast(err.message, { type: 'error' }))
    } else {
      setOpen(false)
    }
  }

  return <div className={`bg-background text-onBackground rounded-lg w-full h-full fixed top-0 left-0 flex flex-col`}>
    <div className="p-5 flex gap-5 items-center">
      <div className="font-semibold">Backlog Lorem ipsum dolor sit amet consectetur</div>
      <div className="p-1 rounded-3xl bg-surface text-onSurface shadow px-3">10:13:23</div>
    </div>

    <Divider />

    <div className="p-5 flex gap-10 grow overflow-y-hidden">

      <div className="flex flex-col gap-5 basis-3/4 ">

        <div className="overflow-x-auto flex gap-5 shrink-0" ref={ref}>
          <div className="overflow-hidden rounded-lg relative">
            <video muted autoPlay={true} ref={myVideoRef} className="h-32 object-cover" />
            <div className="absolute text-white h-1/3 bg-linear-to-b from-transparent to-black left-0 right-0 bottom-0 text-center" >You</div>
          </div>
          {
            Object.keys(others).map(e => <div onClick={() => { setCurrentOther(e); mainVideoRef.current.srcObject = others[e].stream }} className="overflow-hidden rounded-md relative" key={e}>
              <video autoPlay={true} className="h-32 object-cover" />
              <div className="absolute text-white h-1/3 bg-linear-to-b from-transparent to-black left-0 right-0 bottom-0 text-center" >{others[e].user}</div>
            </div>)
          }
        </div>

        <div className="bg-surface text-onSurface shadow rounded-lg grow overflow-y-hidden relative">
          <video muted ref={mainVideoRef} className={`object-cover h-full mx-auto`} autoPlay={true} />
          <div className="absolute bottom-2 right-5 bg-black bg-opacity-30 px-5 rounded-3xl text-white" >{others[currentOther]?.user}</div>
        </div>

        <div className="flex gap-5 shrink-0">
          <div className="px-5 py-1 bg-surface text-onSurface shadow rounded-md flex gap-2 items-center">
            <div>sfa-ate-ajh</div>
            <Divider orientation="vertical" flexItem />
            <IconButton>
              <BsCopy className="w-4 h-4" />
            </IconButton>
          </div>
          <div className="grow"></div>
          <Button variant="outlined" onClick={handleWithVideo} color={withVideo ? 'primary' : 'inherit'}>
            <PiVideoCameraFill className="w-4 h-4" />
          </Button>
          <Button variant="outlined" onClick={handleShareScreen} color={isSharing ? 'primary' : 'inherit'}>
            <PiScreencastBold className="w-4 h-4" />
          </Button>
          <Button variant="outlined" onClick={handleWithAudio} color={withAudio ? 'primary' : 'inherit'}>
            <FaMicrophone className="w-4 h-4" />
          </Button>
          <Button variant="outlined" color="primary">
            <BsThreeDots className="w-4 h-4" />
          </Button>
          <div className="grow"></div>
          <Button variant="outlined" onClick={handleClose} color="error">Leave call</Button>
        </div>
      </div>

      <div className="flex flex-col gap-5 basis-1/4 p-5 bg-surface text-onSurface rounded-lg shadow">
        <div className="flex items-center p-2 bg-background rounded-lg">
          <div className="grow text-center font-semibold py-2 rounded-md bg-primary text-onPrimary">Group</div>
          <div className="grow text-center font-semibold py-2 rounded-md">Personal</div>
        </div>
        <div className="overflow-y-auto grow pr-2">
          <Messages id={id} />
        </div>
        <CreateMessage id={id} />
      </div>

    </div>
  </div>
}

export default function ({ id }) {
  const [open, setOpen] = useState(false)

  const query = useQuery({
    queryKey: ['call_status'],
    queryFn: () => api.get({ q: { groupChat: id, type: 'call' }, limit: 1, page: 0 }).then(res => res.messages)
  }, [id])

  if (query.isError || query.isLoading) return <></>

  const handleCall = () => {
    if (!query.data.length || query.data[query.data.length - 1].status == "ended") {
      const data = new FormData()
      data.append('type', 'call')
      data.append('groupChat', id)
      data.append('status', "started")
      api.create(data)
        .then(() => setOpen(true))
        .catch(err => toast(err.message, { type: 'error' }))
    } else {
      setOpen(true)
    }
  }

  return <div>
    <Dialog open={open}>
      <Call id={id} setOpen={setOpen} />
    </Dialog>

    <Tooltip title={!query.data.length || query.data[query.data.length - 1].status == "ended" ? 'Bắt đầu cuộc gọi' : 'Tham gia cuộc gọi'}>
      <Button size="small" icon={<MdVideoCall />} className="!rounded-full" onClick={handleCall} danger={query.data.length && query.data[query.data.length - 1].status !== "ended"}>
      </Button>
    </Tooltip>
  </div>
}