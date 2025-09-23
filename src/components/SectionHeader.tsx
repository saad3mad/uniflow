import { ReactNode } from "react";

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  align = 'left',
}: {
  eyebrow?: string | ReactNode
  title: string | ReactNode
  subtitle?: string | ReactNode
  actions?: ReactNode
  align?: 'left' | 'center'
}) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start'
  return (
    <div className={`w-full flex flex-col ${alignClass} gap-4 mb-8`}>
      {eyebrow && (
        <div className="inline-flex items-center space-x-2 bg-accent-subtle text-accent-secondary px-3 py-1.5 rounded-full text-sm font-medium">
          {typeof eyebrow === 'string' ? <span>{eyebrow}</span> : eyebrow}
        </div>
      )}
      <h2 className="font-heading font-bold text-3xl sm:text-4xl text-text-primary">{title}</h2>
      {subtitle && (
        <p className="text-text-secondary max-w-3xl">{subtitle}</p>
      )}
      {actions && (
        <div className="mt-2">{actions}</div>
      )}
    </div>
  )
}
