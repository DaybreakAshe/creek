'use client'
import { TerminalDemo } from '@/components/demo/TerminalDemo'
import { MarqueeDemo } from '@/components/demo/MarqueeDemo'

export default function About() {
  return (
    <div className="pt-10 pb-52">
      <div className="flex flex-col items-center justify-center gap-5">
        <TerminalDemo />
        <MarqueeDemo />
      </div>
    </div>
  )
}
