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
        Schema::create('suscripciones', function (Blueprint $table) {
            $table->id('IDsuscripcion');
            $table->foreignId('IDusuario')
                ->unique() // Si un usuario solo puede tener una suscripcion activa a la vez.
                ->constrained('usuarios', 'IDusuario')
                ->onDelete('cascade');

            $table->date('fecha_inicio');
            $table->date('fecha_final');
            $table->enum('tipo', ['Free', 'Go', 'Advanced', 'Premium']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suscripciones');
    }
};
