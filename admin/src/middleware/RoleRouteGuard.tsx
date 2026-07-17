// Import Dependencies
import { Navigate, Outlet } from "react-router";

// Local Imports
import { useAuthContext } from "@/app/contexts/auth/context";

interface RoleRouteGuardProps {
  allowedRoles: Array<"super_admin" | "gp_admin">;
}

export default function RoleRouteGuard({ allowedRoles }: RoleRouteGuardProps) {
  const { user, isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Unauthorized access: redirect to dashboard home
    return <Navigate to="/dashboards/home" replace />;
  }

  return <Outlet />;
}
