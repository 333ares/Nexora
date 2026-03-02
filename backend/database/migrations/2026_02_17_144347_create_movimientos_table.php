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
        Schema::create('movimientos', function (Blueprint $table) {
            $table->id('IDmovimiento');
            $table->foreignId('IDusuario')
                  ->constrained('usuarios', 'IDusuario')
                  ->onDelete('cascade');
            $table->enum('tipo', ['Ingreso', 'Gasto']);
            $table->decimal('cantidad');
            $table->enum('categoria', ['Comida', 'Transporte', 'Ocio', 'Vivienda', 'Salud', 'Otros']);
            $table->date('fecha');
            $table->string('descripcion');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movimientos');
    }
};
