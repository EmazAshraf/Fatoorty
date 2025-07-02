import DashboardLayout, { restaurantSidebarItems } from '@/components/layout/DashboardLayout';
import RestaurantProtectedRoute from '@/components/auth/RestaurantProtectedRoute';

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RestaurantProtectedRoute>
      <DashboardLayout 
        sidebarItems={restaurantSidebarItems}
        role="restaurant"
      >
        {children}
      </DashboardLayout>
    </RestaurantProtectedRoute>
  );
} 