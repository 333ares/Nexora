<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ForoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'titulo' => $this->faker->sentence(6), // Título del foro (frase corta)
            'contenido' => $this->faker->paragraph(4), // Cuerpo de la pregunta/debate
            'visitas' => $this->faker->numberBetween(0, 1000), // Visitas aleatorias iniciales
            // IDusuario, siempre proporcionado por el seeder
        ];
    }
}
