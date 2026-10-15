import { Box, Breadcrumbs, Drawer, IconButton, Link, Typography } from '@mui/material';
import { ChevronRight, Menu as MenuIcon } from 'lucide-react';
import { useState } from 'react';
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const SIDEBAR_WIDTH = 224;

interface Crumb {
  label: string;
  to?: string;
}

// e.g. /expenses/e1 -> Personal > Expenses > Expense details
function getCrumbs(pathname: string): Crumb[] {
  if (pathname.startsWith('/admin/categories')) return [{ label: 'Admin', to: '/admin' }, { label: 'Categories' }];
  if (pathname.startsWith('/admin')) return [{ label: 'Admin' }, { label: 'Overview' }];
  if (pathname.startsWith('/expenses/')) {
    return [{ label: 'Personal' }, { label: 'Expenses', to: '/expenses' }, { label: 'Expense details' }];
  }
  if (pathname.startsWith('/expenses')) return [{ label: 'Personal' }, { label: 'Expenses' }];
  if (pathname.startsWith('/budget')) return [{ label: 'Personal' }, { label: 'Budget' }];
  return [{ label: 'Personal' }, { label: 'Overview' }];
}

// sidebar + top bar around every logged-in page
export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const crumbs = getCrumbs(pathname);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* phones: slides in from the menu button */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { md: 'none' }, '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH } }}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      {/* desktop: stays there */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, borderColor: 'divider' },
        }}
      >
        <Sidebar />
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          component="header"
          sx={{
            height: 72,
            px: { xs: 2, md: 4.5 },
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <IconButton onClick={() => setMobileOpen(true)} aria-label="Open menu" sx={{ display: { md: 'none' } }}>
            <MenuIcon size={20} />
          </IconButton>

          <Breadcrumbs separator={<ChevronRight size={14} />} sx={{ fontSize: '0.875rem' }}>
            {crumbs.map((crumb, i) => {
              const isLast = i === crumbs.length - 1;
              if (isLast) {
                return (
                  <Typography key={crumb.label} sx={{ fontSize: 'inherit', fontWeight: 500, color: 'text.primary' }}>
                    {crumb.label}
                  </Typography>
                );
              }
              return crumb.to ? (
                <Link key={crumb.label} component={RouterLink} to={crumb.to} underline="hover" color="text.secondary">
                  {crumb.label}
                </Link>
              ) : (
                <Typography key={crumb.label} sx={{ fontSize: 'inherit', color: 'text.secondary' }}>
                  {crumb.label}
                </Typography>
              );
            })}
          </Breadcrumbs>

          <Typography sx={{ ml: 'auto', fontSize: '0.8125rem', color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
            RWF · Rwandan franc
          </Typography>
        </Box>

        <Box component="main" sx={{ p: { xs: 2, md: 4.5 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
