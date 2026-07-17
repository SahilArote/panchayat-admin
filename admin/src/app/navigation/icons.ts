import { TbPalette } from "react-icons/tb";
import {
  HomeIcon,
  UserIcon as HiUserIcon,
  ChatBubbleLeftRightIcon,
  DocumentCheckIcon,
  MegaphoneIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  BuildingOffice2Icon,
  UsersIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { ElementType } from "react";

import DashboardsIcon from "@/assets/dualicons/dashboards.svg?react";
import SettingIcon from "@/assets/dualicons/setting.svg?react";

export const navigationIcons: Record<string, ElementType> = {
  dashboards: DashboardsIcon,
  settings: SettingIcon,
  "dashboards.home": HomeIcon,
  "dashboards.complaints": ChatBubbleLeftRightIcon,
  "dashboards.certificates": DocumentCheckIcon,
  "dashboards.notices": MegaphoneIcon,
  "dashboards.schemes": ClipboardDocumentListIcon,
  "dashboards.water-bills": CreditCardIcon,
  "dashboards.panchayats": BuildingOffice2Icon,
  "dashboards.citizens": UsersIcon,
  "dashboards.admin-users": ShieldCheckIcon,
  "dashboards.gram-sabha": UserGroupIcon,
  "settings.general": HiUserIcon,
  "settings.appearance": TbPalette,
};
