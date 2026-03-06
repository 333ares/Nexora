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
        Schema::create('chunks', function (Blueprint $table) {
            $table->id('IDchunk');
            $table->longText('texto'); //String soporta hasta 255 caracteres, pero los chunks tienen mas de esa cifra.
            $table->longText('embedding'); //Porque contiene arrays de numeros tipo 0.123...
            $table->string('fuente', 255);

            // Clave Foránea hacia USUARIOS
            $table->foreignId('IDusuario')
                ->constrained('usuarios', 'IDusuario')
                ->onDelete('cascade');

            // Clave Foránea hacia ACADEMIA
            $table->foreignId('IDcontenido')
                ->constrained('academia', 'IDcontenido')
                ->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chunks');
    }
};
