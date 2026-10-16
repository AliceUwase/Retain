import { Box } from '@mui/material';
import {
  BookOpen,
  Bus,
  Clapperboard,
  HeartPulse,
  House,
  Repeat,
  ShoppingBag,
  Tag,
  Utensils,
  Zap,
  type LucideIcon,
} from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  'cat-food': Utensils,
  'cat-transport': Bus,
  'cat-housing': House,
  'cat-utilities': Zap,
  'cat-health': HeartPulse,
  'cat-entertainment': Clapperboard,
  'cat-shopping': ShoppingBag,
  'cat-education': BookOpen,
  'cat-subscriptions': Repeat,
};

// small rounded box with the category's icon, a plain tag for new or unknown ones
export default function CategoryIcon({ categoryId, size = 36 }: { categoryId: string; size?: number }) {
  const Icon = icons[categoryId] ?? Tag;

  return (
    <Box
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 2,
        display: 'grid',
        placeItems: 'center',
        bgcolor: '#F2F2EC',
        color: 'text.secondary',
      }}
    >
      <Icon size={size / 2} />
    </Box>
  );
}
