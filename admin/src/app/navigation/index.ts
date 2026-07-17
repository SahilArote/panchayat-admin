import { useMemo } from "react";
import { dashboards } from "./segments/dashboards";
import { NavigationTree } from "@/@types/navigation";
import { useAuthContext } from "@/app/contexts/auth/context";

export const navigation: NavigationTree[] = [
  dashboards,
];

export function filterNavigationForRole(navItems: NavigationTree[], role?: string): NavigationTree[] {
  if (!role) return [];
  return navItems
    .map((item) => {
      // If item has roles, verify the role matches
      if (item.roles && !item.roles.includes(role)) {
        return null;
      }
      
      // If item has childs, filter recursively
      if (item.childs) {
        const filteredChilds = filterNavigationForRole(item.childs, role);
        if (filteredChilds.length === 0) {
          return null;
        }
        return {
          ...item,
          childs: filteredChilds,
        };
      }
      
      return item;
    })
    .filter((x): x is NavigationTree => x !== null);
}

export function useFilteredRoutes() {
  const { user } = useAuthContext();
  const role = user?.role;
  return useMemo(() => {
    return filterNavigationForRole(navigation, role);
  }, [role]);
}
