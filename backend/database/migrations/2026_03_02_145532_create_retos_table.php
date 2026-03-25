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
            $table->id('IDreto');
            $table->string('titulo');
            $table->decimal('cantidad', 15, 2);
            $table->date('fecha_inicio');
            $table->date('fecha_final');
            $table->boolean('activo');
            $table->boolean('cumplido');
            $table->foreignId('usuario_id');
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
