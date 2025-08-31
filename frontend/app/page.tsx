
import { ScanForm } from '@/components/ScanForm'
import { InventorySummary } from '@/components/InventorySummary'

export default function Page() {
  return (
    <main className="space-y-6">
      <ScanForm />
      {/* Demo tile hooked to octocat/Hello-World */}
      <InventorySummary owner="octocat" repo="Hello-World" />
    </main>
  )
}
