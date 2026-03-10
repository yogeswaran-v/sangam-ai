import { TopBar } from '@/components/dashboard/TopBar'
import { ProductDemo } from '@/components/demo/ProductDemo'

export default function DemoPage() {
  return (
    <div>
      <TopBar title="Product Demo" />
      <main className="p-6 lg:p-8">
        <ProductDemo />
      </main>
    </div>
  )
}
