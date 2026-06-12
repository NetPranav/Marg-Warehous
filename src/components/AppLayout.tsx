import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Avatar, Badge, Tooltip,
  useMediaQuery, useTheme, Divider, alpha,
} from '@mui/material';
import {
  Dashboard, LocalShipping, Anchor, Recommend, Warning,
  Notifications, Menu as MenuIcon, Logout, ViewInAr, ViewInArOutlined,
} from '@mui/icons-material';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/api/endpoints';

const DRAWER_WIDTH = 260;
const BROWN = '#8B3A0E';
const BROWN_DARK = '#6D2D09';
const ORANGE = '#E8700A';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { label: 'Incoming Shipments', icon: <LocalShipping />, path: '/shipments' },
  { label: 'Dock Management', icon: <Anchor />, path: '/docks' },
  { label: 'Dock Recommendations', icon: <Recommend />, path: '/recommendations' },
  {
    path: '/digital-twin',
    icon: <ViewInArOutlined />,
    label: 'Smart Slotting',
  },
  { label: 'Detention Monitor', icon: <Warning />, path: '/detention' },
  { label: 'Notifications', icon: <Notifications />, path: '/notifications' },
];

export default function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const { data: unreadData } = useQuery({
    queryKey: ['unread-count'],
    queryFn: () => notificationsApi.unreadCount(),
    refetchInterval: 30000,
  });
  const unreadCount = unreadData?.data?.data?.unread_count ?? 0;

  const currentLabel = NAV_ITEMS.find(n => location.pathname.startsWith(n.path))?.label || 'Dashboard';

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#FFFCF9', color: '#1A1A2E' }}>
      {/* Logo */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: '10px',
          background: `linear-gradient(135deg, ${BROWN} 0%, ${ORANGE} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 18, color: '#fff',
        }}>
          L
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ color: BROWN, fontWeight: 800, lineHeight: 1.2, fontSize: '1rem' }}>
            LogiMind AI
          </Typography>
          <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.7rem' }}>
            Warehouse Portal
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(139,58,14,0.08)', mx: 2 }} />

      {/* Digital Twin CTA */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <ListItemButton
          onClick={() => navigate('/digital-twin')}
          sx={{
            borderRadius: '12px', py: 1,
            background: `linear-gradient(135deg, ${BROWN} 0%, ${BROWN_DARK} 100%)`,
            color: '#fff',
            '&:hover': { background: `linear-gradient(135deg, ${BROWN_DARK} 0%, #5A2307 100%)` },
          }}
        >
          <ListItemIcon sx={{ color: '#fff', minWidth: 36 }}><ViewInAr /></ListItemIcon>
          <ListItemText primary="Smart Slotting" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }} />
        </ListItemButton>
      </Box>

      {/* Nav items */}
      <List sx={{ px: 1.5, flex: 1, pt: 2 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.path}
              onClick={() => { navigate(item.path); if (isMobile) setDrawerOpen(false); }}
              sx={{
                borderRadius: '12px', mb: 0.5, py: 1,
                bgcolor: isActive ? alpha(BROWN, 0.08) : 'transparent',
                color: isActive ? BROWN : '#6B7280',
                '&:hover': { bgcolor: alpha(BROWN, 0.05), color: BROWN },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: isActive ? 600 : 400 }} />
              {item.label === 'Notifications' && unreadCount > 0 && (
                <Badge badgeContent={unreadCount} color="error" sx={{ mr: 1 }} />
              )}
            </ListItemButton>
          );
        })}
      </List>

      {/* User */}
      <Divider sx={{ borderColor: 'rgba(139,58,14,0.08)', mx: 2 }} />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 34, height: 34, bgcolor: BROWN, fontSize: '0.85rem', fontWeight: 700 }}>
          {user?.full_name?.charAt(0) || 'U'}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ color: '#1A1A2E', fontWeight: 600, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.full_name}
          </Typography>
          <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.65rem' }}>
            {user?.role?.replace(/_/g, ' ')}
          </Typography>
        </Box>
        <Tooltip title="Logout">
          <IconButton size="small" onClick={logout} sx={{ color: '#9CA3AF', '&:hover': { color: '#EF4444' } }}>
            <Logout fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FAF9F7' }}>
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: DRAWER_WIDTH, flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none', boxShadow: '2px 0 12px rgba(139,58,14,0.06)' },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: isMobile ? '100%' : `calc(100% - ${drawerOpen ? DRAWER_WIDTH : 0}px)`,
          transition: 'width 0.3s',
          minWidth: 0,
        }}
      >
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#FFFCF9', borderBottom: '1px solid rgba(139,58,14,0.06)' }}>
          <Toolbar sx={{ gap: 2 }}>
            {isMobile && (
              <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: '#1A1A2E' }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ flex: 1, color: '#1A1A2E', fontWeight: 700 }}>
              {currentLabel}
            </Typography>
            <Tooltip title="Notifications">
              <IconButton onClick={() => navigate('/notifications')} sx={{ color: '#6B7280' }}>
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, p: { xs: 1.5, md: 2.5 }, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
