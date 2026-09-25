import type { IconName } from '@omnikit/core';
import {
  ArrowLeftRight, Binary, Braces, CaseSensitive, Clock, Eraser, FileCode, FileImage, FileStack, FileText, FileType,
  Fingerprint, Hash, Heading, Image, Images, KeyRound, Link, Merge, Palette, Pilcrow, QrCode, RefreshCcw, Ruler,
  Scaling, Scissors, ShieldCheck, Table, Type, Landmark, Calculator, TrendingUp, PiggyBank, HandCoins, House, Percent, ChartLine, Receipt, BadgePercent, Scale, CalendarDays, UsersRound,
  type LucideIcon,
} from 'lucide-react-native';

const icons: Record<IconName, LucideIcon> = {
  ArrowLeftRight, Binary, Braces, CaseSensitive, Clock, Eraser, FileCode, FileImage, FileStack, FileText, FileType,
  Fingerprint, Hash, Heading, Image, Images, KeyRound, Link, Merge, Palette, Pilcrow, QrCode, RefreshCcw, Ruler,
  Scaling, Scissors, ShieldCheck, Table, Type, Landmark, Calculator, TrendingUp, PiggyBank, HandCoins, House, Percent, ChartLine, Receipt, BadgePercent, Scale, CalendarDays, UsersRound,
};

export function RegistryIcon({ name, size = 20, color }: { name: IconName; size?: number; color: string }) {
  const Component = icons[name];
  return <Component size={size} color={color} strokeWidth={1.6} />;
}
