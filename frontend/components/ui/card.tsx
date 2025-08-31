
import { ReactNode } from 'react'
export function Card({ children }: { children: ReactNode }) {
  return <div className="card">{children}</div>
}
export function CardHeader({ children }: { children: ReactNode }) {
  return <div className="px-5 pt-5">{children}</div>
}
export function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-lg font-semibold">{children}</h3>
}
export function CardDescription({ children }: { children: ReactNode }) {
  return <p className="text-sm text-neutral-500 mt-1">{children}</p>
}
export function CardContent({ children }: { children: ReactNode }) {
  return <div className="px-5 pb-5">{children}</div>
}
