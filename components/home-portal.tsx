"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Play } from "lucide-react"
import { joinSession } from "@/lib/actions"

export function HomePortal() {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) return

    setIsLoading(true)

    try {
      const token = await joinSession(username)

      if (token) {
        // Navigate to player with token
        router.push(`/player?token=${token}&username=${encodeURIComponent(username)}`)
      }
    } catch (error) {
      console.error("Failed to join session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setUsername("")
  }

  return (
    <Card className="w-full max-w-md bg-gray-900 border-gray-800">
      <CardHeader className="space-y-1 flex flex-col items-center">
        <Play className="h-12 w-12 text-red-500 mb-2" />
        <CardTitle className="text-2xl text-center">Streaming Test</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="username"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-800 border-gray-700"
              disabled={isLoading}
            />
          </div>
          <CardFooter className="flex justify-between p-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={isLoading}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              CLEAR
            </Button>
            <Button
              type="submit"
              disabled={!username.trim() || isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              GO TO PLAYER
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
