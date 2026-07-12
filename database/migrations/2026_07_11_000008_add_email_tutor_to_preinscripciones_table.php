<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('preinscripciones', function (Blueprint $table) {
            $table->string('email_tutor')->nullable()->after('telefono_tutor');
        });
    }

    public function down(): void
    {
        Schema::table('preinscripciones', function (Blueprint $table) {
            $table->dropColumn('email_tutor');
        });
    }
};
