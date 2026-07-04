import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import loginStore from '@/routes/login/store';

const Login = () => {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(loginStore.url());
  };

  return (
    <>
      <Head title="Iniciar Sesión" />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="bg-white rounded-[24px] border border-black/5 p-12 w-full max-w-[420px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] text-center text-gray-900">
          <h2 className="m-0 mb-2 text-[32px] font-bold tracking-tight text-gray-900">Bienvenido</h2>
          <p className="m-0 mb-8 text-[15px] text-gray-500">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col items-start gap-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                placeholder="ejemplo@correo.com"
                autoComplete="email"
                disabled={processing}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div className="flex flex-col items-start gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={processing}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={data.remember}
                onChange={(e) => setData('remember', e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="remember" className="text-sm text-gray-600">
                Recordarme
              </Label>
            </div>

            <Button type="submit" disabled={processing} className="w-full">
              {processing ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
