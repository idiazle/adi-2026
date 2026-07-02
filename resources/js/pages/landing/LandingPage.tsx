import { Link, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import intranet from '@/routes/intranet';

// TODO: Crear ruta para Portal del Concursante
const CONCURSO_PORTAL_URL = '#';

const CURRENT_YEAR = new Date().getFullYear();

const LandingPage = () => {
    return (
        <>
            <Head title="Bienvenidos - Academia" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center items-center p-6">
                {/* Encabezado Principal */}
                <header className="text-center mb-12">
                    {/* TODO: Reemplazar con logo real de la academia */}
                    <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto shadow-lg">
                        🎓
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl md:text-5xl">
                        Plataforma Educativa Integral
                    </h1>
                    <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                        Selecciona el portal al que deseas ingresar para continuar.
                    </p>
                </header>

                {/* Contenedor de Accesos (Los dos caminos) */}
                <main className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl w-full">
                    {/* Tarjeta: Portal Académico */}
                    <article
                        className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between items-center text-center hover:shadow-md hover:border-blue-200 transition-all duration-300"
                        role="region"
                        aria-label="Portal Académico"
                    >
                        <div>
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl sm:text-2xl mb-4 mx-auto font-bold">
                                📖
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Plataforma Académica</h2>
                            <p className="text-gray-500 mb-6 text-sm sm:text-base">
                                Accede a tus clases virtuales, calificaciones, asistencia y material de estudio diario.
                            </p>
                        </div>
                        <Link href={intranet.auth.login().url} className="w-full">
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                aria-label="Ingresar al Portal Académico como Estudiante"
                            >
                                Ingresar como Estudiante
                            </Button>
                        </Link>
                    </article>

                    {/* Tarjeta: Portal del Concurso */}
                    <article
                        className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between items-center text-center hover:shadow-md hover:border-amber-200 transition-all duration-300"
                        role="region"
                        aria-label="Portal del Concurso Académico"
                    >
                        <div>
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xl sm:text-2xl mb-4 mx-auto font-bold">
                                🏆
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Concurso Académico</h2>
                            <p className="text-gray-500 mb-6 text-sm sm:text-base">
                                Regístrate, rinde tu examen de admisión o concurso, y sigue los resultados en tiempo real.
                            </p>
                        </div>
                        <Link href={CONCURSO_PORTAL_URL} className="w-full">
                            <Button
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-medium transition-colors duration-200 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                                aria-label="Ingresar al Portal del Concursante"
                            >
                                Portal del Concursante
                            </Button>
                        </Link>
                    </article>
                </main>

                {/* Pie de página institucional */}
                <footer className="mt-16 text-sm text-gray-400 text-center">
                    <p>&copy; {CURRENT_YEAR} Tu Academia. Todos los derechos reservados.</p>
                </footer>
            </div>
        </>
    );
}

export default LandingPage;
