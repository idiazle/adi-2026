<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->timestamps();
        });

        // Sembrar roles base del sistema
        \DB::table('roles')->insert([
            ['name' => 'student',  'created_at' => now(), 'updated_at' => now()],
            ['name' => 'teacher',  'created_at' => now(), 'updated_at' => now()],
            ['name' => 'parent',   'created_at' => now(), 'updated_at' => now()],
            ['name' => 'tutor',    'created_at' => now(), 'updated_at' => now()],
            ['name' => 'admin',    'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
