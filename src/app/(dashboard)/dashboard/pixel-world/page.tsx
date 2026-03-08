import { TopBar } from '@/components/dashboard/TopBar'
import { PixelWorld } from '@/components/pixel-world/PixelWorld'

export default function PixelWorldPage() {
  return (
    <div>
      <TopBar title="Pixel World" />
      <main className="p-6">
        <PixelWorld />
      </main>
    </div>
  )
}
