import { MarqueeDemo } from '@/components/demo/MarqueeDemo'
import { GlobeDemo } from '@/components/demo/GlobeDemo'

const Page = () => {
  return (
    <div className="container mx-auto p-3">
      <GlobeDemo/>
      <MarqueeDemo />
    </div>
  )
}
export default Page
