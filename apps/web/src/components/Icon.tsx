import type { IconName } from '@omnikit/core';
import {
  ArrowLeftRight, Binary, Braces, CaseSensitive, Clock, Eraser, FileCode, FileImage, FileStack, FileText, FileType,
  Fingerprint, Hash, Heading, Image, Images, KeyRound, Link, Merge, Palette, Pilcrow, QrCode, RefreshCcw, Ruler,
  Scaling, Scissors, ShieldCheck, Table, Type, Landmark, Calculator, TrendingUp, PiggyBank, HandCoins, House, Percent, ChartLine, Receipt, BadgePercent, Scale, CalendarDays, UsersRound,
  type LucideIcon, type LucideProps,
} from 'lucide-react';

const icons: Record<IconName, LucideIcon> = {
  ArrowLeftRight, Binary, Braces, CaseSensitive, Clock, Eraser, FileCode, FileImage, FileStack, FileText, FileType,
  Fingerprint, Hash, Heading, Image, Images, KeyRound, Link, Merge, Palette, Pilcrow, QrCode, RefreshCcw, Ruler,
  Scaling, Scissors, ShieldCheck, Table, Type, Landmark, Calculator, TrendingUp, PiggyBank, HandCoins, House, Percent, ChartLine, Receipt, BadgePercent, Scale, CalendarDays, UsersRound,
};

/** Renders a registry icon name with the app's default stroke. */
export function RegistryIcon({ name, size = 20, ...props }: { name: IconName } & LucideProps) {
  const Component = icons[name];
  return <Component size={size} strokeWidth={1.6} aria-hidden {...props} />;
}
