import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Login } from '@/pages/Login'
import { UserDirectory } from '@/pages/UserDirectory'
import { GroupDirectory } from '@/pages/GroupDirectory'
import { CertificationCampaigns } from '@/pages/CertificationCampaigns'
import { AuditLog } from '@/pages/AuditLog'
import { ProvisioningTimeline } from '@/pages/ProvisioningTimeline'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/users" replace />} />
          <Route path="users" element={<UserDirectory />} />
          <Route path="groups" element={<GroupDirectory />} />
          <Route path="campaigns" element={<CertificationCampaigns />} />
          <Route path="audit" element={<AuditLog />} />
          <Route path="events" element={<ProvisioningTimeline />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
