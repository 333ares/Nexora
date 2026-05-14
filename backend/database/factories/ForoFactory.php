<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ForoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'titulo'    => $this->faker->sentence(6),
            'contenido' => $this->faker->paragraph(4),
            'visitas'   => $this->faker->numberBetween(0, 1000),
        ];
    }
}