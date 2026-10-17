import AutorenewIcon from '@mui/icons-material/Autorenew';
import BoltIcon from '@mui/icons-material/Bolt';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HomeIcon from '@mui/icons-material/Home';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MovieIcon from '@mui/icons-material/Movie';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { Box, type SvgIconProps } from '@mui/material';
import type { ComponentType } from 'react';

// solid icons, so categories stand out from the outlined UI icons
const icons: Record<string, ComponentType<SvgIconProps>> = {
  'cat-food': RestaurantIcon,
  'cat-transport': DirectionsBusIcon,
  'cat-housing': HomeIcon,
  'cat-utilities': BoltIcon,
  'cat-health': FavoriteIcon,
  'cat-entertainment': MovieIcon,
  'cat-shopping': ShoppingBagIcon,
  'cat-education': MenuBookIcon,
  'cat-subscriptions': AutorenewIcon,
};

// `size` is the space it takes up; the icon fills most of it. New or unknown categories get a tag.
export default function CategoryIcon({ categoryId, size = 36 }: { categoryId: string; size?: number }) {
  const Icon = icons[categoryId] ?? LocalOfferIcon;

  return (
    <Box sx={{ width: size, height: size, flexShrink: 0, display: 'grid', placeItems: 'center', color: 'text.secondary' }}>
      <Icon sx={{ fontSize: Math.round(size * 0.6) }} />
    </Box>
  );
}
