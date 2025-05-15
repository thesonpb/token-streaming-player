"use client"

import { Play } from "lucide-react"
import Link from "next/link"

interface HeaderProps {
  username: string | null
}

export function Header({ username }: HeaderProps) {
  return (
    <header className="border-b border-gray-800 bg-gray-900 py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Play className="h-6 w-6 text-red-500" />
          <span className="text-xl font-bold">Streaming Test</span>
        </Link>
        {username && (
          <div className="flex items-center gap-2">
            <span className="text-gray-300">Welcome,</span>
            <span className="font-medium">{username}</span>
          </div>
        )}
      </div>
    </header>
  )
}
