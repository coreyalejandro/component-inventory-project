
import './globals.css'
import type { Metadata } from 'next'
import { clsx } from 'clsx'

export const metadata: Metadata = {
  title: 'GitInventory Dashboard',
  description: 'Visualize GitHub repository inventories'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={clsx('min-h-screen')}>
        <div className="max-w-6xl mx-auto p-6">
          <header className="mb-6">
            <h1 className="text-2xl font-bold">GitInventory</h1>
            <p className="text-sm text-neutral-600">Dashboard for repository scans and inventories</p>
          </header>
          {children}
        </div>
      </body>
    </html>
  )
}
