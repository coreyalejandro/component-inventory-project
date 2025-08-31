
import { ReactNode } from 'react'
export function Table({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto"><table className="min-w-full text-sm">{children}</table></div>
}
export function THead({ children }: { children: ReactNode }) {
  return <thead className="text-left text-neutral-500">{children}</thead>
}
export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y">{children}</tbody>
}
export function TR({ children }: { children: ReactNode }) {
  return <tr className="hover:bg-neutral-50">{children}</tr>
}
export function TH({ children }: { children: ReactNode }) {
  return <th className="px-4 py-2 font-medium">{children}</th>
}
export function TD({ children }: { children: ReactNode }) {
  return <td className="px-4 py-2">{children}</td>
}
