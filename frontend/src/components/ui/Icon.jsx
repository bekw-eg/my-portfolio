import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserIcon,
  Mail01Icon,
  LockPasswordIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  AtIcon,
  DashboardSquare01Icon,
  Logout01Icon,
  Sun01Icon,
  Moon01Icon,
  Globe02Icon,
  Menu01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Add01Icon,
  Delete02Icon,
  Edit01Icon,
} from '@hugeicons/core-free-icons';

const ICONS = {
  user: UserIcon,
  mail: Mail01Icon,
  lock: LockPasswordIcon,
  arrowLeft: ArrowLeft01Icon,
  arrowRight: ArrowRight01Icon,
  at: AtIcon,
  dashboard: DashboardSquare01Icon,
  logout: Logout01Icon,
  sun: Sun01Icon,
  moon: Moon01Icon,
  globe: Globe02Icon,
  menu: Menu01Icon,
  close: Cancel01Icon,
  check: CheckmarkCircle01Icon,
  add: Add01Icon,
  delete: Delete02Icon,
  edit: Edit01Icon,
};

export default function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.7, ...rest }) {
  const icon = ICONS[name];
  if (!icon) return null;
  return <HugeiconsIcon icon={icon} size={size} color={color} strokeWidth={strokeWidth} {...rest} />;
}

