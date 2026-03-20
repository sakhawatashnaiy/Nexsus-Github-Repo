import { useEffect, useMemo, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

type ConnectionStatus = 'idle' | 'connecting' | 'waiting' | 'calling' | 'in-call' | 'ended' | 'error'

type JoinAck = {
  participants: number
  isInitiator: boolean
}

type Props = {
  roomId: string
  disabled?: boolean
}

function getApiOrigin() {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (!base) return window.location.origin
  try {
    const url = new URL(base)
    // baseApi points to .../api, signaling is on the same origin.
    url.pathname = ''
    url.search = ''
    url.hash = ''
    return url.toString().replace(/\/$/, '')
  } catch {
    // If it's a relative path like /api
    return window.location.origin
  }
}

function stopStream(stream: MediaStream | null) {
  if (!stream) return
  for (const track of stream.getTracks()) track.stop()
}

export function VideoCallPanel({ roomId, disabled }: Props) {
  const [status, setStatus] = useState<ConnectionStatus>('idle')
  const [errorText, setErrorText] = useState<string | null>(null)
  const [participants, setParticipants] = useState<number>(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [supportsMedia, setSupportsMedia] = useState(true)

  const socketRef = useRef<Socket | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)

  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)

  const apiOrigin = useMemo(() => getApiOrigin(), [])

  function ensurePeerConnection() {
    if (pcRef.current) return pcRef.current

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })

    pc.onicecandidate = (event) => {
      if (!event.candidate) return
      socketRef.current?.emit('webrtc:ice-candidate', { roomId, candidate: event.candidate })
    }

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState
      if (state === 'connected') setStatus('in-call')
      if (state === 'failed' || state === 'disconnected') {
        // keep UI responsive, user can end/rejoin
        setStatus((s) => (s === 'ended' ? s : 'error'))
      }
    }

    pc.ontrack = (event) => {
      const stream = event.streams[0]
      if (!stream) return
      remoteStreamRef.current = stream
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream
      }
    }

    pcRef.current = pc
    return pc
  }

  async function ensureLocalMedia() {
    if (localStreamRef.current) return localStreamRef.current

    if (!navigator.mediaDevices?.getUserMedia) {
      setSupportsMedia(false)
      throw new Error('Camera/microphone not available in this browser.')
    }

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    localStreamRef.current = stream

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream
    }

    return stream
  }

  async function startOffer() {
    const pc = ensurePeerConnection()
    const stream = await ensureLocalMedia()

    // Add tracks once
    for (const track of stream.getTracks()) {
      const senders = pc.getSenders()
      if (senders.some((s) => s.track?.id === track.id)) continue
      pc.addTrack(track, stream)
    }

    setStatus('calling')

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    socketRef.current?.emit('webrtc:offer', { roomId, sdp: pc.localDescription })
  }

  async function handleOffer(sdp: RTCSessionDescriptionInit) {
    const pc = ensurePeerConnection()
    const stream = await ensureLocalMedia()

    for (const track of stream.getTracks()) {
      const senders = pc.getSenders()
      if (senders.some((s) => s.track?.id === track.id)) continue
      pc.addTrack(track, stream)
    }

    await pc.setRemoteDescription(new RTCSessionDescription(sdp))
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    socketRef.current?.emit('webrtc:answer', { roomId, sdp: pc.localDescription })
  }

  async function handleAnswer(sdp: RTCSessionDescriptionInit) {
    const pc = ensurePeerConnection()
    await pc.setRemoteDescription(new RTCSessionDescription(sdp))
  }

  async function handleIce(candidate: RTCIceCandidateInit) {
    const pc = ensurePeerConnection()
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate))
    } catch {
      // ignore duplicates
    }
  }

  async function joinRoom() {
    if (disabled || status === 'connecting') return

    setErrorText(null)
    setStatus('connecting')

    try {
      await ensureLocalMedia()

      const socket = io(apiOrigin, {
        transports: ['websocket'],
        withCredentials: true,
      })

      socketRef.current = socket

      socket.on('connect_error', () => {
        setStatus('error')
        setErrorText('Could not connect to signaling server.')
      })

      socket.on('room:participants', (payload: { participants: number }) => {
        setParticipants(payload?.participants ?? 0)
      })

      socket.on('room:peer-joined', async () => {
        // Existing peer will receive this when someone joins.
        // The new joiner is marked as initiator via ack.
      })

      socket.on('room:peer-left', () => {
        setParticipants((p) => Math.max(0, p - 1))
        setStatus('waiting')
      })

      socket.on('webrtc:offer', async (payload: { sdp: RTCSessionDescriptionInit }) => {
        await handleOffer(payload.sdp)
      })

      socket.on('webrtc:answer', async (payload: { sdp: RTCSessionDescriptionInit }) => {
        await handleAnswer(payload.sdp)
      })

      socket.on('webrtc:ice-candidate', async (payload: { candidate: RTCIceCandidateInit }) => {
        await handleIce(payload.candidate)
      })

      const ack: JoinAck = await new Promise((resolve) => {
        socket.emit('room:join', { roomId }, (res: JoinAck) => resolve(res))
      })

      setParticipants(ack.participants)

      if (ack.isInitiator) {
        await startOffer()
      } else {
        setStatus('waiting')
      }
    } catch (e) {
      setStatus('error')
      setErrorText(e instanceof Error ? e.message : 'Failed to start call.')
    }
  }

  function toggleMic() {
    const stream = localStreamRef.current
    if (!stream) return
    const tracks = stream.getAudioTracks()
    const next = !isMuted
    for (const t of tracks) t.enabled = !next
    setIsMuted(next)
  }

  function toggleCamera() {
    const stream = localStreamRef.current
    if (!stream) return
    const tracks = stream.getVideoTracks()
    const next = !isCameraOff
    for (const t of tracks) t.enabled = !next
    setIsCameraOff(next)
  }

  async function endCall() {
    try {
      socketRef.current?.emit('room:leave', { roomId })
    } catch {
      // ignore
    }

    socketRef.current?.disconnect()
    socketRef.current = null

    pcRef.current?.close()
    pcRef.current = null

    stopStream(localStreamRef.current)
    stopStream(remoteStreamRef.current)

    localStreamRef.current = null
    remoteStreamRef.current = null

    if (localVideoRef.current) localVideoRef.current.srcObject = null
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null

    setParticipants(0)
    setIsMuted(false)
    setIsCameraOff(false)
    setStatus('ended')
  }

  useEffect(() => {
    setStatus('idle')
    setParticipants(0)
    setErrorText(null)
    setIsMuted(false)
    setIsCameraOff(false)
    setSupportsMedia(true)

    // Clean up when room changes / component unmount
    return () => {
      void endCall()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

  const canJoin = !disabled && (status === 'idle' || status === 'ended' || status === 'error')
  const inCall = status === 'waiting' || status === 'calling' || status === 'in-call'

  return (
    <div className="mt-4 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold">Call room</div>
          <div className="mt-0.5 text-xs text-[rgb(var(--muted))]">Room: {roomId}</div>
        </div>
        <Badge variant="muted">Participants: {participants}</Badge>
      </div>

      {!supportsMedia ? (
        <div className="mt-3 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-2 text-sm text-[rgb(var(--muted))]">
          Camera/microphone access is not available. Try a different browser.
        </div>
      ) : errorText ? (
        <div className="mt-3 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-2 text-sm text-[rgb(var(--muted))]">
          {errorText}
        </div>
      ) : null}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))]">
          <video
            ref={localVideoRef}
            className="aspect-video w-full object-cover"
            autoPlay
            playsInline
            muted
          />
          <div className="absolute left-2 top-2 rounded-md bg-black/50 px-2 py-0.5 text-xs text-white">
            You
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))]">
          <video
            ref={remoteVideoRef}
            className="aspect-video w-full object-cover"
            autoPlay
            playsInline
          />
          <div className="absolute left-2 top-2 rounded-md bg-black/50 px-2 py-0.5 text-xs text-white">
            Participant
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {canJoin ? (
          <Button size="sm" variant="primary" onClick={() => void joinRoom()}>
            Join room
          </Button>
        ) : null}

        {inCall ? (
          <>
            <Button size="sm" variant={isMuted ? 'secondary' : 'ghost'} onClick={toggleMic}>
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>
            <Button
              size="sm"
              variant={isCameraOff ? 'secondary' : 'ghost'}
              onClick={toggleCamera}
            >
              {isCameraOff ? 'Camera on' : 'Camera off'}
            </Button>
            <Button size="sm" variant="danger" onClick={() => void endCall()}>
              End
            </Button>
          </>
        ) : null}
      </div>

      <div className="mt-2 text-xs text-[rgb(var(--muted))]">
        Status: <span className="font-medium">{status}</span>
      </div>
    </div>
  )
}
