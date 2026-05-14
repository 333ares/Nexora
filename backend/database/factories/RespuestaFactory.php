<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class RespuestaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'respuesta' => $this->faker->paragraph(2),
        ];
    }
}