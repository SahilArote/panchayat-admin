import { Navigate, RouteObject } from "react-router";

import AuthGuard from "@/middleware/AuthGuard";
import RoleRouteGuard from "@/middleware/RoleRouteGuard";
import { DynamicLayout } from "../layouts/DynamicLayout";
import { AppLayout } from "../layouts/AppLayout";

/**
 * Protected routes configuration
 * These routes require authentication to access
 * Uses AuthGuard middleware to verify user authentication
 */
const protectedRoutes: RouteObject = {
  id: "protected",
  Component: AuthGuard,
  children: [
    // The dynamic layout supports both the main layout and the sideblock.
    {
      Component: DynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboards/home" />,
        },
        {
          path: "dashboards",
          children: [
            {
              index: true,
              element: <Navigate to="/dashboards/home" />,
            },
            {
              path: "home",
              lazy: async () => ({
                Component: (await import("@/app/pages/dashboards/home")).default,
              }),
            },
            {
              path: "complaints",
              lazy: async () => ({
                Component: (await import("@/app/pages/dashboards/complaints")).default,
              }),
            },
            {
              path: "certificates",
              lazy: async () => ({
                Component: (await import("@/app/pages/dashboards/certificates")).default,
              }),
            },
            {
              path: "notices",
              lazy: async () => ({
                Component: (await import("@/app/pages/dashboards/notices")).default,
              }),
            },
            {
              path: "schemes",
              lazy: async () => ({
                Component: (await import("@/app/pages/dashboards/schemes")).default,
              }),
            },
            {
              path: "water-bills",
              lazy: async () => ({
                Component: (await import("@/app/pages/dashboards/water-bills")).default,
              }),
            },
            {
              path: "citizens",
              lazy: async () => ({
                Component: (await import("@/app/pages/dashboards/citizens")).default,
              }),
            },
            {
              path: "gram-sabha",
              lazy: async () => ({
                Component: (await import("@/app/pages/dashboards/gram-sabha")).default,
              }),
            },
            // Super Admin only routes protected by RoleRouteGuard
            {
              path: "panchayats",
              element: <RoleRouteGuard allowedRoles={["super_admin"]} />,
              children: [
                {
                  index: true,
                  lazy: async () => ({
                    Component: (await import("@/app/pages/dashboards/panchayats")).default,
                  }),
                },
              ],
            },
            {
              path: "admin-users",
              element: <RoleRouteGuard allowedRoles={["super_admin"]} />,
              children: [
                {
                  index: true,
                  lazy: async () => ({
                    Component: (await import("@/app/pages/dashboards/admin-users")).default,
                  }),
                },
              ],
            },
          ],
        },
      ],
    },
    // The app layout supports only the main layout. Avoid using it for other layouts.
    {
      Component: AppLayout,
      children: [
        {
          path: "settings",
          lazy: async () => ({
            Component: (await import("@/app/pages/settings/Layout")).default,
          }),
          children: [
            {
              index: true,
              element: <Navigate to="/settings/general" />,
            },
            {
              path: "general",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/settings/sections/General")
                ).default,
              }),
            },
            {
              path: "appearance",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/settings/sections/Appearance")
                ).default,
              }),
            },
          ],
        },
      ],
    },
  ],
};

export { protectedRoutes };
