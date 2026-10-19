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

// solid icons, so categories stand out from the outlined UI icons; matched by name,
// because the ids are made by the database and differ between local and live data
const icons: Record<string, ComponentType<SvgIconProps>> = {
  'food & drink': RestaurantIcon,
  transport: DirectionsBusIcon,
  housing: HomeIcon,
  utilities: BoltIcon,
  health: FavoriteIcon,
  entertainment: MovieIcon,
  shopping: ShoppingBagIcon,
  education: MenuBookIcon,
  subscriptions: AutorenewIcon,
};

// `size` is the space it takes up; the icon fills most of it. New, renamed or unknown categories get a tag.
export default function CategoryIcon({ name, size = 36 }: { name: string; size?: number }) {
  const Icon = icons[name.toLowerCase()] ?? LocalOfferIcon;

  return (
    <Box sx={{ width: size, height: size, flexShrink: 0, display: 'grid', placeItems: 'center', color: 'text.secondary' }}>
      <Icon sx={{ fontSize: Math.round(size * 0.6) }} />
    </Box>
  );
}
