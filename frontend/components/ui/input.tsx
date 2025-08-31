
import { InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement> & { className?: string }) {
  return <input {...props} className={clsx('input', className)} />
}
