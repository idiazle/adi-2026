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
        Schema::create('persons', function (Blueprint $table) {
            $table->id();

            // Identificación
            $table->enum('document_type', ['DNI', 'CE', 'PAS', 'PTP'])->nullable();
            $table->string('document_number', 30)->nullable();

            // Datos personales
            $table->string('first_name');
            $table->string('last_name');
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['M', 'F', 'O'])->nullable();

            // Contacto
            $table->string('phone_number', 30)->nullable();
            $table->string('address')->nullable();

            $table->timestamps();

            // Índices
            $table->unique(['document_type', 'document_number'], 'persons_doc_unique');
            $table->index(['last_name', 'first_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('persons');
    }
};
