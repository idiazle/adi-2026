<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $person_id
 * @property string $username
 * @property string $password_hash
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Person $person
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Role> $roles
 */
#[Fillable([
    'person_id',
    'username',
    'password_hash',
    'is_active',
])]
#[Hidden(['password_hash'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'password_hash' => 'hashed',
        ];
    }

    // ==================== Auth overrides ====================

    /**
     * Laravel Authenticatable espera una columna `password`.
     * En este esquema la columna es `password_hash`.
     */
    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    // ==================== Relaciones ====================

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    // ==================== Helpers de roles ====================

    /**
     * ¿El usuario tiene el rol indicado?
     */
    public function hasRole(string $roleName): bool
    {
        return $this->roles()->where('name', $roleName)->exists();
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(Role::ADMIN);
    }

    public function isSecretaria(): bool
    {
        return $this->hasRole(Role::SECRETARIA);
    }

    /**
     * ¿Puede operar caja (crear inscripciones, registrar pagos)?
     * Tanto admin como secretaria tienen este permiso.
     */
    public function puedeOperarCaja(): bool
    {
        return $this->isAdmin() || $this->isSecretaria();
    }

    /**
     * ¿Puede validar pagos y aprobar preinscripciones?
     * Solo admin.
     */
    public function puedeValidarPagos(): bool
    {
        return $this->isAdmin();
    }

    public function isTeacher(): bool
    {
        return $this->hasRole(Role::TEACHER);
    }

    public function isStudent(): bool
    {
        return $this->hasRole(Role::STUDENT);
    }

    public function isParent(): bool
    {
        return $this->hasRole(Role::PARENT);
    }

    public function isTutor(): bool
    {
        return $this->hasRole(Role::TUTOR);
    }

    /**
     * Asigna un rol al usuario (idempotente).
     */
    public function assignRole(string $roleName): void
    {
        $role = Role::where('name', $roleName)->firstOrFail();
        $this->roles()->syncWithoutDetaching([$role->id]);
    }

    // ==================== Scopes ====================

    public function scopeActivos($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeWithRole($query, string $roleName)
    {
        return $query->whereHas('roles', fn ($q) => $q->where('name', $roleName));
    }
}
