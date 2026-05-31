export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-3xl p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-sm text-gray-500">This section is coming soon.</p>
    </div>
  )
}
