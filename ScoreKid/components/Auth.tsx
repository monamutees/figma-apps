import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

type AuthMode = 'login' | 'register' | 'reset';

export const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, resetPassword } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'login') {
        const success = await login(formData.email, formData.password);
        if (!success) {
          setError('Credenciales incorrectas. Verifica tu email y contraseña.');
        }
      } else if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden.');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres.');
          setLoading(false);
          return;
        }
        const success = await register(formData.email, formData.password, formData.name);
        if (!success) {
          setError('Este email ya está registrado. Intenta con otro email.');
        }
      } else if (mode === 'reset') {
        const success = await resetPassword(formData.email);
        if (success) {
          setSuccess('Se ha enviado un enlace de recuperación a tu email.');
        } else {
          setError('No se encontró una cuenta con este email.');
        }
      }
    } catch (err) {
      setError('Ha ocurrido un error. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Iniciar Sesión';
      case 'register': return 'Crear Cuenta';
      case 'reset': return 'Recuperar Contraseña';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'login': return 'Accede a tu cuenta de ScoreKid';
      case 'register': return 'Crea una nueva cuenta para empezar';
      case 'reset': return 'Te enviaremos un enlace para recuperar tu contraseña';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mb-2">⚽ ScoreKid</CardTitle>
          <CardTitle>{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Tu nombre completo"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="tu@email.com"
              />
            </div>

            {mode !== 'reset' && (
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Tu contraseña"
                />
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Confirma tu contraseña"
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Procesando...' : getTitle()}
            </Button>
          </form>

          <div className="mt-4 text-center space-y-2">
            {mode === 'login' && (
              <>
                <Button 
                  variant="link" 
                  onClick={() => setMode('reset')}
                  className="text-sm"
                >
                  ¿Olvidaste tu contraseña?
                </Button>
                <div>
                  <span className="text-sm text-gray-600">¿No tienes cuenta? </span>
                  <Button 
                    variant="link" 
                    onClick={() => setMode('register')}
                    className="text-sm p-0"
                  >
                    Regístrate
                  </Button>
                </div>
              </>
            )}

            {mode === 'register' && (
              <div>
                <span className="text-sm text-gray-600">¿Ya tienes cuenta? </span>
                <Button 
                  variant="link" 
                  onClick={() => setMode('login')}
                  className="text-sm p-0"
                >
                  Inicia sesión
                </Button>
              </div>
            )}

            {mode === 'reset' && (
              <Button 
                variant="link" 
                onClick={() => setMode('login')}
                className="text-sm"
              >
                Volver al inicio de sesión
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};