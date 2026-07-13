<?php

namespace App\Providers;

use App\Models\Pago;
use App\Observers\PagoObserver;
use Carbon\CarbonImmutable;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->ensureStorageSymlink();
        $this->configureDefaults();
        $this->registerObservers();
    }

    /**
     * Garantiza que public/storage exista como symlink a storage/app/public
     * para que las imágenes de comprobantes (uploads) sean servibles vía HTTP.
     * Idempotente: si el symlink ya existe, no hace nada.
     */
    protected function ensureStorageSymlink(): void
    {
        $publicStorage = public_path('storage');
        $target        = storage_path('app/public');

        if (file_exists($publicStorage)) {
            return;
        }

        if (! is_dir($target)) {
            return;
        }

        try {
            (new Filesystem())->link($target, $publicStorage);
        } catch (\Throwable) {
            // Silencioso: en entornos donde no se permite crear symlinks
            // (Windows sin permisos, hosting compartido, etc.) el operador
            // deberá correr `php artisan storage:link` manualmente.
        }
    }

    /**
     * Los observers se registran aquí en vez de en un ServiceProvider dedicado
     * para mantener simple el árbol de proveedores.
     */
    protected function registerObservers(): void
    {
        Pago::observe(PagoObserver::class);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
