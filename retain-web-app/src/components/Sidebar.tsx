import { Avatar, Box, ButtonBase, List, ListItemButton, Menu, MenuItem, Typography } from '@mui/material';
import { ChartPie, ChevronsUpDown, LayoutDashboard, LogOut, ReceiptText, ShieldCheck, Tags, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const personalLinks: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: ReceiptText },
  { to: '/budget', label: 'Budget', icon: ChartPie },
];

const adminLinks: NavItem[] = [
  { to: '/admin', label: 'Admin overview', icon: ShieldCheck },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
];

// "Alice Maiden" -> "AM"
function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function NavLinks({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <List disablePadding sx={{ display: 'grid', gap: 0.5 }}>
      {items.map(({ to, label, icon: Icon }) => (
        <ListItemButton
          key={to}
          component={NavLink}
          to={to}
          end={to === '/admin'} // so /admin isn't highlighted on /admin/categories
          onClick={onNavigate}
          sx={{
            gap: 1.5,
            borderRadius: 2,
            py: 1,
            color: 'text.secondary',
            fontSize: '0.9375rem',
            '&.active': { bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600 },
          }}
        >
          <Icon size={18} />
          {label}
        </ListItemButton>
      ))}
    </List>
  );
}

// onNavigate closes the drawer on phones after a link is tapped
export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, signOut } = useAuth();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  if (!user) return null;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2.5, bgcolor: '#EFEEE7' }}>
      {/* logo image goes here once it's in src/assets */}
      <Typography sx={{ px: 1, mb: 4, fontSize: '1.625rem', fontWeight: 500 }}>Retain</Typography>

      <NavLinks items={personalLinks} onNavigate={onNavigate} />

      {user.role === 'admin' && (
        <>
          <Typography
            sx={{ px: 2, mt: 3, mb: 1, fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}
          >
            Admin
          </Typography>
          <NavLinks items={adminLinks} onNavigate={onNavigate} />
        </>
      )}

      {/* account box, pushed to the bottom */}
      <ButtonBase
        onClick={(e) => setMenuAnchor(e.currentTarget)}
        sx={{ mt: 'auto', p: 1, gap: 1.5, borderRadius: 2, justifyContent: 'flex-start', textAlign: 'left' }}
      >
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light', color: 'primary.dark', fontSize: '0.875rem', fontWeight: 600 }}>
          {initials(user.name)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
            {user.name}
          </Typography>
          <Typography noWrap sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            {user.role === 'admin' ? 'Admin account' : 'Personal account'}
          </Typography>
        </Box>
        <ChevronsUpDown size={16} />
      </ButtonBase>

      <Menu
        anchorEl={menuAnchor}
        open={menuAnchor !== null}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <MenuItem onClick={signOut} sx={{ gap: 1.5 }}>
          <LogOut size={16} />
          Sign out
        </MenuItem>
      </Menu>
    </Box>
  );
}
