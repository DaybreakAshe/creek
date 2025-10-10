import { ModeToggle } from '@/components/theme/ModeToggle'

export const Header = () => {
  return (
    <div className="border-border flex h-16 w-full items-center border-b">
      <div className="container mx-auto flex h-full w-full items-center justify-between px-3">
        <h1 className="text-2xl font-bold">Creek</h1>
        <ModeToggle />
      </div>
    </div>
  )
}
