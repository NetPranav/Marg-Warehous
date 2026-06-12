import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, TextField, Button, Typography, CircularProgress, Alert, InputAdornment, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { authApi } from '@/api/endpoints';
import { useAuthStore } from '@/stores/authStore';

const BROWN = '#8B3A0E';
const BROWN_DARK = '#6D2D09';
const ORANGE = '#E8700A';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(email, password);
      const { user, access, refresh } = res.data;
      login(user, access, refresh);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(145deg, #FAF9F7 0%, #FFF5EE 40%, #FAF9F7 100%)',
      p: 3, position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative glow */}
      <Box sx={{
        position: 'absolute', top: '10%', right: '10%', width: 350, height: 350,
        borderRadius: '50%', background: `radial-gradient(circle, rgba(139,58,14,0.06) 0%, transparent 70%)`,
      }} />
      <Box sx={{
        position: 'absolute', bottom: '15%', left: '10%', width: 250, height: 250,
        borderRadius: '50%', background: `radial-gradient(circle, rgba(232,112,10,0.05) 0%, transparent 70%)`,
      }} />

      <Card sx={{ p: 4, width: '100%', maxWidth: 420, position: 'relative', border: '1px solid rgba(139,58,14,0.06)' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: '14px', mx: 'auto', mb: 1.5,
            background: `linear-gradient(135deg, ${BROWN} 0%, ${ORANGE} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 20,
            boxShadow: `0 4px 14px rgba(139,58,14,0.25)`,
          }}>
            L
          </Box>
          <Typography variant="h5" sx={{ color: BROWN }}>Warehouse Portal</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>Sign in to manage operations</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            type="email" autoComplete="email" sx={{ mb: 2 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#9CA3AF' }} /></InputAdornment> }}
          />
          <TextField
            fullWidth label="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? 'text' : 'password'} autoComplete="current-password" sx={{ mb: 3 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#9CA3AF' }} /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            fullWidth type="submit" variant="contained" size="large" disabled={loading}
            sx={{ py: 1.5, fontSize: '0.95rem' }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
          </Button>
        </form>

        <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: '#9CA3AF' }}>
          LogiMind AI — Intelligent Logistics
        </Typography>
      </Card>
    </Box>
  );
}
