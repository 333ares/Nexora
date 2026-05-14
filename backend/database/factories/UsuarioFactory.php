<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UsuarioFactory extends Factory
{
    public function definition(): array
    {
        // Contraseña fija para todos los usuarios de prueba
        $password = "12345!";

        return [
            'usuario' => fake()->unique()->userName(), // Nombre de usuario único
            'nombre' => fake()->firstName(), // Nombre real
            'apellidos' => fake()->lastName(), // Apellidos
            'balance_total' => fake()->randomFloat(2, 0, 5000), // Saldo inicial aleatorio entre 0 y 5000€
            'email' => fake()->unique()->safeEmail(),  // Email único
            'password' => Hash::make($password), // Contraseña hasheada
            'estado' => 'activo', // Todos activos por defecto
        ];
    }

    // Crea el usuario administrador con credenciales fijas (IDusuario = 1 por inserción)
    public function admin(): Factory
    {
        return $this->state(fn(array $attributes) => [
            'usuario' => 'admin',
            'email' => 'admin@gmail.com',
        ]);
    }

    // Crea un usuario estándar con credenciales fijas para pruebas manuales
    public function user(): Factory
    {
        return $this->state(fn(array $attributes) => [
            'usuario' => 'user',
            'email' => 'user@gmail.com',
        ]);
    }
}
