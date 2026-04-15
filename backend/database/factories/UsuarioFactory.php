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
        $email = "user@gmail.com";
        $password = "12345!";

        return [
            'usuario' => fake()->userName(),
            'nombre' => fake()->name(),
            'apellidos' => fake()->lastName(),
            'balance_total' => fake()->randomFloat(2, 0, 1000),
            'email' => $email,
            'password' => Hash::make($password)
        ];
    }
}
