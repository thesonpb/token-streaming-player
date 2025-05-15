import { HomePortal } from "@/components/home-portal"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header username={null} />
      <div className="flex-1 flex items-center justify-center p-4">
        <HomePortal />
      </div>
    </main>
  )
}
