<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class MovimientosFactory extends Factory
{
    public function definition(): array
    {
        // Categorías válidas según el tipo de movimiento
        $categoriasIngreso = ['Nomina', 'Capital y alquileres', 'Negocios y ventas', 'Otros'];
        $categoriasGasto   = ['Ocio', 'Supervivencia', 'Cultura', 'Extras o imprevistos'];

        // El tipo se elige primero para poder asignar la categoría correspondiente
        $tipo = $this->faker->randomElement(['ingreso', 'gasto']);

        return [
            'tipo' => $tipo, // 'ingreso' o 'gasto'
            'cantidad' => $this->faker->randomFloat(2, 5, 3000), // Importe entre 5€ y 3000€
            'categoria' => $tipo === 'ingreso'  // Categoría según el tipo
                ? $this->faker->randomElement($categoriasIngreso)
                : $this->faker->randomElement($categoriasGasto),
            'fecha' => $this->faker->dateTimeBetween('-3 months', 'now'), // Últimos 3 meses
            'descripcion' => $this->faker->sentence(4), // Descripción breve
            // usuario_id, siempre proporcionado por el seeder
        ];
    }
}
