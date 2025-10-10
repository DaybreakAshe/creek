import { Globe } from 'components/ui/globe'

export function GlobeDemo() {
  return (
    <div className="bg-background relative mx-auto flex size-full max-w-lg items-center justify-center overflow-hidden rounded-lg px-40 pt-8 pb-40 md:pb-60">
      <Globe className="top-28" />
      <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.2),rgba(255,255,255,0))]" />
    </div>
  )
}
