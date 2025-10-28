'use client'
import { useState, useEffect } from 'react'


interface HelloData {
  message: string
  time: string
}

export default function About() {

  const testMongo = async () => {
    const res = await fetch('/api/test')
    const data = await res.json()
    console.log('###data', data)
  }

  useEffect(() => {
    testMongo()
  }, [])

  return (
    <div className="pt-10 pb-52">
     
    </div>
  )
}
