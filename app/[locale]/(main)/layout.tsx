import { MainContent } from '@/components/layout/MainContent'

export default function MainSectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <MainContent variant="constrained">{children}</MainContent>
}
