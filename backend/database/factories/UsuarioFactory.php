<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Usuario>
 */
class UsuarioFactory extends Factory
{
    public function definition(): array
    {
        $password = "12345!";

        return [
            'usuario' => fake()->userName(),
            'nombre' => fake()->name(),
            'apellidos' => fake()->lastName(),
            'balance_total' => fake()->randomFloat(2, 0, 5000),
            'email' => fake()->unique()->safeEmail(),
            'password' => Hash::make($password),
            'estado' => 'activo'
        ];
    }

    public function admin(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'usuario' => 'admin',
                'email' => 'admin@gmail.com'
            ];
        });
    }

    public function user(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'usuario' => 'user',
                'email' => 'user@gmail.com'
            ];
        });
    }
}
