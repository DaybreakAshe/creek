'use client'
import { useState, useEffect } from 'react'
import { TerminalDemo } from '@/components/demo/TerminalDemo'
import { MarqueeDemo } from '@/components/demo/MarqueeDemo'

interface HelloData {
  message: string
  time: string
}

export default function About() {
  const [data, setData] = useState<HelloData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const fetchHelloMessage = async () => {
      try {
        const response = await fetch('/api/hello')
        if (!response.ok) throw new Error('Failed to fetch')
        const result: HelloData = await response.json()
        console.log('result', result)
        setData(result)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchHelloMessage()
  }, [])


  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div className="pt-10 pb-52">
      <div className="flex flex-col items-center justify-center gap-5">
        <TerminalDemo />
        <MarqueeDemo />
      </div>
    </div>
  )
}
