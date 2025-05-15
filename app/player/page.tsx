import { Header } from "@/components/header"
import { VideoPlayer } from "@/components/video-player"
import { Suspense } from "react"

export default function PlayerPage({
  searchParams,
}: {
  searchParams: { token?: string; username?: string }
}) {
  const token = searchParams.token || ""
  const username = searchParams.username || ""

  return (
    <main className="min-h-screen flex flex-col">
      <Header username={username} />
      <div className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={<div>Loading player...</div>}>
          <VideoPlayer token={token} username={username} />
        </Suspense>
      </div>
    </main>
  )
}
