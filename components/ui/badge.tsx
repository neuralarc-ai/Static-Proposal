import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'info', children, ...props }, ref) => {
    const variants = {
      success: 'bg-mint text-verdant',
      warning: 'bg-solar text-primary',
      danger: 'bg-ion text-primary',
      info: 'bg-dataflow text-primary',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export default Badge

