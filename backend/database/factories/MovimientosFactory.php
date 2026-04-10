<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Movimientos>
 */
class MovimientosFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Definimos los grupos según tus reglas
        $categoriasIngreso = ['Nomina', 'Capital y alquileres', 'Negocios y ventas', 'Ootros'];
        $categoriasGasto = ['Ocio', 'Supervivencia', 'Cultura', 'Extras o imprevistos'];

        // Elegimos el tipo primero
        $tipo = $this->faker->randomElement(['ingreso', 'gasto']);

        return [
            'tipo' => $tipo,
            'cantidad' => $this->faker->randomFloat(2, 5, 3000),
            // Si es ingreso usa sus categorías, si no, las de gasto
            'categoria' => $tipo === 'ingreso'
                ? $this->faker->randomElement($categoriasIngreso)
                : $this->faker->randomElement($categoriasGasto),
            'fecha' => $this->faker->dateTimeBetween('-3 months', 'now'),
            'descripcion' => $this->faker->sentence(4),
            'usuario_id' => 1, // Cambia esto si tienes lógica de usuarios dinámica
        ];
    }
}
