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
            $table->id('IDreto'); // Tu clave primaria
            $table->string('titulo');
            $table->string('emoji')->nullable();
            $table->decimal('cantidad', 15, 2);
            $table->date('fecha_inicio')->useCurrent();
            $table->date('fecha_final');
            $table->boolean('activo')->default(true);
            $table->boolean('cumplido')->default(false);
            
            // 1. Creamos la columna
            $table->unsignedBigInteger('IDusuario');
            
            // 2. Creamos la relación (Asumiendo que tu tabla de usuarios se llama 'usuarios' y su id es 'IDusuario')
            $table->foreign('IDusuario')
                ->references('IDusuario')
                ->on('usuarios')
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
