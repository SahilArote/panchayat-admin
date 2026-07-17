import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

const ROOT_DASHBOARDS = "/dashboards";

const joinPath = (root: string, item: string) => `${root}${item}`;

export const dashboards: NavigationTree = {
  ...baseNavigationObj["dashboards"],
  type: "root",
  childs: [
    {
      id: "dashboards.home",
      path: joinPath(ROOT_DASHBOARDS, "/home"),
      type: "item",
      title: "Dashboard Home",
      transKey: "nav.dashboards.home",
      icon: "dashboards.home",
      roles: ["super_admin", "gp_admin"],
    },
    {
      id: "dashboards.complaints",
      path: joinPath(ROOT_DASHBOARDS, "/complaints"),
      type: "item",
      title: "Complaints",
      transKey: "nav.dashboards.complaints",
      icon: "dashboards.complaints",
      roles: ["super_admin", "gp_admin"],
    },
    {
      id: "dashboards.certificates",
      path: joinPath(ROOT_DASHBOARDS, "/certificates"),
      type: "item",
      title: "Certificates",
      transKey: "nav.dashboards.certificates",
      icon: "dashboards.certificates",
      roles: ["super_admin", "gp_admin"],
    },
    {
      id: "dashboards.notices",
      path: joinPath(ROOT_DASHBOARDS, "/notices"),
      type: "item",
      title: "Notices Board",
      transKey: "nav.dashboards.notices",
      icon: "dashboards.notices",
      roles: ["super_admin", "gp_admin"],
    },
    {
      id: "dashboards.schemes",
      path: joinPath(ROOT_DASHBOARDS, "/schemes"),
      type: "item",
      title: "Schemes Catalog",
      transKey: "nav.dashboards.schemes",
      icon: "dashboards.schemes",
      roles: ["super_admin", "gp_admin"],
    },
    {
      id: "dashboards.water-bills",
      path: joinPath(ROOT_DASHBOARDS, "/water-bills"),
      type: "item",
      title: "Water Bills Dues",
      transKey: "nav.dashboards.water-bills",
      icon: "dashboards.water-bills",
      roles: ["super_admin", "gp_admin"],
    },
    {
      id: "dashboards.panchayats",
      path: joinPath(ROOT_DASHBOARDS, "/panchayats"),
      type: "item",
      title: "Panchayat Manager",
      transKey: "nav.dashboards.panchayats",
      icon: "dashboards.panchayats",
      roles: ["super_admin"],
    },
    {
      id: "dashboards.citizens",
      path: joinPath(ROOT_DASHBOARDS, "/citizens"),
      type: "item",
      title: "Citizens Directory",
      transKey: "nav.dashboards.citizens",
      icon: "dashboards.citizens",
      roles: ["super_admin", "gp_admin"],
    },
    {
      id: "dashboards.admin-users",
      path: joinPath(ROOT_DASHBOARDS, "/admin-users"),
      type: "item",
      title: "Admin Users",
      transKey: "nav.dashboards.admin-users",
      icon: "dashboards.admin-users",
      roles: ["super_admin"],
    },
    {
      id: "dashboards.gram-sabha",
      path: joinPath(ROOT_DASHBOARDS, "/gram-sabha"),
      type: "item",
      title: "Gram Sabha Meetings",
      transKey: "nav.dashboards.gram-sabha",
      icon: "dashboards.gram-sabha",
      roles: ["super_admin", "gp_admin"],
    },
  ],
};
