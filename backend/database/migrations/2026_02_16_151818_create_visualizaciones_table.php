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
        Schema::create('visualizaciones', function (Blueprint $table) {
            $table->id('IDvisualizaciones');
            $table->string('titulo');
            $table->integer('valoracion'); //Los limites de numero los estabecemos en controller
            
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
        Schema::dropIfExists('visualizaciones');
    }
};
