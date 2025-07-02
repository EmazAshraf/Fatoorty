import DashboardLayout, { superadminSidebarItems } from '@/components/layout/DashboardLayout';

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout 
      sidebarItems={superadminSidebarItems}
      role="superadmin"
    >
      {children}
    </DashboardLayout>
  );
} 