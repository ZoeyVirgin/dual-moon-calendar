import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 安全合并 Tailwind CSS 类名，自动解决样式冲突
 *
 * 使用 clsx 进行条件类名组合，twMerge 进行 Tailwind 专属的冲突解决。
 * 例如：cn('px-2 py-1', 'px-4') → 'py-1 px-4'（后者的px-4覆盖前者的px-2）
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
