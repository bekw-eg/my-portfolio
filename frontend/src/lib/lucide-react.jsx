import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  AlertCircleIcon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Award01Icon,
  BarChartIcon,
  BookOpen01Icon,
  Briefcase01Icon,
  Calendar01Icon,
  Call02Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  CodeIcon,
  DashboardSquare01Icon,
  Delete02Icon,
  Download01Icon,
  Edit01Icon,
  FavouriteIcon,
  FilterIcon,
  FolderOpenIcon,
  GameController02Icon,
  Github01Icon,
  Globe02Icon,
  Home01Icon,
  InstagramIcon,
  Location01Icon,
  LockPasswordIcon,
  Logout01Icon,
  Mail01Icon,
  Moon01Icon,
  Mortarboard01Icon,
  Search01Icon,
  SentIcon,
  SlidersHorizontalIcon,
  StarIcon,
  Sun01Icon,
  Tag01Icon,
  UserGroupIcon,
  UserIcon,
  ViewIcon,
  ViewOffIcon,
  ZapIcon,
} from '@hugeicons/core-free-icons';

const createIcon = (icon) => {
  const Component = ({ size = 18, color = 'currentColor', strokeWidth = 1.7, fill, style, ...rest }) => (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color={fill && fill !== 'none' ? fill : color}
      strokeWidth={strokeWidth}
      style={style}
      {...rest}
    />
  );

  return Component;
};

export const LayoutDashboard = createIcon(DashboardSquare01Icon);
export const FolderOpen = createIcon(FolderOpenIcon);
export const BookOpen = createIcon(BookOpen01Icon);
export const Award = createIcon(Award01Icon);
export const Mail = createIcon(Mail01Icon);
export const Zap = createIcon(ZapIcon);
export const User = createIcon(UserIcon);
export const LogOut = createIcon(Logout01Icon);
export const ChevronRight = createIcon(ArrowRight01Icon);
export const Sun = createIcon(Sun01Icon);
export const Moon = createIcon(Moon01Icon);
export const Briefcase = createIcon(Briefcase01Icon);
export const GraduationCap = createIcon(Mortarboard01Icon);
export const Home = createIcon(Home01Icon);
export const Globe = createIcon(Globe02Icon);
export const ChevronDown = createIcon(ArrowDown01Icon);
export const Github = createIcon(Github01Icon);
export const Instagram = createIcon(InstagramIcon);
export const Gamepad2 = createIcon(GameController02Icon);
export const Send = createIcon(SentIcon);
export const Heart = createIcon(FavouriteIcon);
export const ArrowUpRight = createIcon(ArrowUpRight01Icon);
export const Search = createIcon(Search01Icon);
export const Clock = createIcon(Clock01Icon);
export const Eye = createIcon(ViewIcon);
export const Star = createIcon(StarIcon);
export const Tag = createIcon(Tag01Icon);
export const ArrowRight = createIcon(ArrowRight01Icon);
export const ArrowLeft = createIcon(ArrowLeft01Icon);
export const Calendar = createIcon(Calendar01Icon);
export const MapPin = createIcon(Location01Icon);
export const Phone = createIcon(Call02Icon);
export const CheckCircle = createIcon(CheckmarkCircle01Icon);
export const AlertCircle = createIcon(AlertCircleIcon);
export const ArrowDown = createIcon(ArrowDown01Icon);
export const ExternalLink = createIcon(ArrowUpRight01Icon);
export const Code2 = createIcon(CodeIcon);
export const Lock = createIcon(LockPasswordIcon);
export const EyeOff = createIcon(ViewOffIcon);
export const Download = createIcon(Download01Icon);
export const Filter = createIcon(FilterIcon);
export const SlidersHorizontal = createIcon(SlidersHorizontalIcon);
export const Plus = createIcon(Add01Icon);
export const Edit2 = createIcon(Edit01Icon);
export const Trash2 = createIcon(Delete02Icon);
export const TrendingUp = createIcon(BarChartIcon);
export const Users = createIcon(UserGroupIcon);
export const BarChart2 = createIcon(BarChartIcon);
export const Settings = createIcon(SlidersHorizontalIcon);
export const Palette = createIcon(SlidersHorizontalIcon);
export const Sparkles = createIcon(ZapIcon);
