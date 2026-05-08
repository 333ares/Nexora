<?php

namespace Database\Factories;

use App\Models\Reto;
use Illuminate\Database\Eloquent\Factories\Factory;

class RetoFactory extends Factory
{
    protected $model = Reto::class;

    public function definition(): array
    {
        $fechaInicio = $this->faker->dateTimeBetween('-4 months', 'now');
        $fechaFinal = $this->faker->dateTimeBetween($fechaInicio, '+3 months');
        $cantidad = $this->faker->randomFloat(2, 10, 1000);

        $expirado = $fechaFinal < new \DateTime();
        $cantidad_actual = $this->faker->randomFloat(2, 0, $cantidad);
        $cumplido = $cantidad_actual >= $cantidad;

        // Activo = no cumplido y no expirado
        $activo = !$cumplido && !$expirado;

        return [
            'titulo' => $this->faker->sentence(3),
            'cantidad' => $cantidad,
            'cantidad_actual' => $cantidad_actual,
            'fecha_inicio' => $fechaInicio,
            'fecha_final' => $fechaFinal,
            'cumplido' => $cumplido,
            'activo' => $activo,
        ];
    }
}
