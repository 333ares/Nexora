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
                ->unique() // Opcional: si un usuario solo puede tener una suscripción activa a la vez
                ->constrained('usuarios', 'IDusuario')
                ->onDelete('cascade');

            $table->date('fecha_inicio');
            $table->date('fecha_final');
            $table->string('tipo_suscripcion');
            
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
