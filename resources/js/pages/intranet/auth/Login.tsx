import React, { useState } from 'react';
import { Head } from '@inertiajs/react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Manejar la lógica de inicio de sesión aquí
    console.log({ email, password });
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
              <label className="text-sm font-medium text-gray-700">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 text-base outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="ejemplo@correo.com"
                required
              />
            </div>

            <div className="flex flex-col items-start gap-2">
              <label className="text-sm font-medium text-gray-700">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 text-base outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl border-none bg-indigo-600 text-white text-base font-semibold cursor-pointer transition-all duration-300 mt-2 shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)]"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
