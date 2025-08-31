
import { ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'
export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return <button {...props} className={clsx('btn', className)} />
}
