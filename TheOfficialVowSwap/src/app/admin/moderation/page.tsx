import { Metadata } from 'next'
import ModerationDashboard from '@/app/components/admin/moderation/ModerationDashboard'

export const metadata: Metadata = {
  title: 'Content Moderation | Admin Dashboard',
  description: 'Manage and moderate user-generated content across the platform',
}

export default function ModerationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ModerationDashboard />
    </div>
  )
}
