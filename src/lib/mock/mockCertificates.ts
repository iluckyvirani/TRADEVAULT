export type CertificateCategory = 'evaluation' | 'funded' | 'milestone'

export interface Certificate {
  id: string
  title: string
  category: CertificateCategory
  issuedAt: string
  accountId: string
  programLabel: string
}

/** Mock certificates — empty by default; add entries to preview list UI */
export const mockCertificates: Certificate[] = []

export function countByCategory(
  certificates: Certificate[],
  category: CertificateCategory | 'all',
): number {
  if (category === 'all') return certificates.length
  return certificates.filter((c) => c.category === category).length
}

export function filterCertificates(
  certificates: Certificate[],
  category: CertificateCategory | 'all',
): Certificate[] {
  if (category === 'all') return certificates
  return certificates.filter((c) => c.category === category)
}
