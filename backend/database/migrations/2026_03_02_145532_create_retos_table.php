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
        Schema::create('retos', function (Blueprint $table) {
            $table->id('IDreto'); // Clave primaria
            $table->boolean('activo')->default(true); //El reto está activo por defecto.
            $table->boolean('cumplido')->default(false); //No se ha cumplido a menos que se marque lo contrario
            $table->decimal('cantidad', 15, 2);
            $table->date('fecha_inicio');
            $table->date('fecha_final');
            
            // Calcula la duracion si es necesario, o la guardamos como entero
            $table->integer('duracion')->comment('Duración en días');

            //Clave Foranea hacia tabla usuarios
            $table->foreignId('IDusuario')
                ->constrained('usuarios', 'IDusuario')
                ->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('retos');
    }
};
