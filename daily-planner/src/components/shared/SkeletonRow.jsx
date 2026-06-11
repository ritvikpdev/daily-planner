export function SkeletonRow({ width = '100%', height = '16px' }) {
  return (
    <div
      className="rounded animate-pulse bg-gray-700"
      style={{ width, height }}
    />
  )
}
