export default function Brand({ size = 'base' }: { size?: 'base' | 'lg' }) {
  const sizeClasses = size === 'lg' ? 'text-[48px] leading-[48px]' : 'text-2xl'
  return (
    <span className={`brand-wordmark gradient-text leading-none ${sizeClasses}`}>
      uniflow
    </span>
  )
}
