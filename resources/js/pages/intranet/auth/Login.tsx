import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import login from '@/routes/intranet/auth/login';

const Login = () => {
  const { data, setData, post, processing, errors } = useForm({
    username: '',
    password: '',
    remember: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(login.store.url());
  };

  return (
    <>
      <Head title="Iniciar Sesión" />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="bg-white rounded-[24px] border border-gray-200 p-12 w-full max-w-[420px] shadow-[0_10px_40px_-10px_rgba(128,128,128,0.08)] text-center text-gray-900">
          <h2 className="m-0 mb-2 text-[32px] font-bold tracking-tight text-gray-900">Bienvenido</h2>
          <p className="m-0 mb-8 text-[15px] text-gray-500">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col items-start gap-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                value={data.username}
                onChange={(e) => setData('username', e.target.value)}
                placeholder="tu usuario"
                autoComplete="username"
                disabled={processing}
                required
              />
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">{errors.username}</p>
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
                required
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
                disabled={processing}
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
