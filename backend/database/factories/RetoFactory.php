<?php

namespace Database\Factories;

use App\Models\Reto;
use Illuminate\Database\Eloquent\Factories\Factory;

class RetoFactory extends Factory
{
    protected $model = Reto::class;

    public function definition(): array
    {
        // Rango de fechas: el reto empezó hace máximo 4 meses y termina en máximo 3 meses
        $fechaInicio = $this->faker->dateTimeBetween('-4 months', 'now');
        $fechaFinal = $this->faker->dateTimeBetween($fechaInicio, '+3 months');

        // Cantidad objetivo del reto y cantidad ahorrada hasta ahora
        $cantidad = $this->faker->randomFloat(2, 10, 1000);
        $cantidad_actual  = $this->faker->randomFloat(2, 0, $cantidad);

        // Un reto está cumplido si ya se alcanzó el objetivo
        $cumplido = $cantidad_actual >= $cantidad;

        // Un reto está expirado si la fecha final ya pasó (y no está cumplido)
        $expirado = $fechaFinal < new \DateTime();

        // Activo solo si ni está cumplido ni ha expirado
        $activo = !$cumplido && !$expirado;

        return [
            'titulo' => $this->faker->sentence(3), // Nombre del reto
            'cantidad' => $cantidad, // Objetivo de ahorro
            'cantidad_actual' => $cantidad_actual, // Dinero aportado hasta ahora
            'fecha_inicio' => $fechaInicio, // Inicio del período
            'fecha_final' => $fechaFinal, // Fecha límite
            'cumplido' => $cumplido, // true si cantidad_actual >= cantidad
            'activo' => $activo, // true si no cumplido ni expirado
            // usuario_id, siempre proporcionado por el seeder
        ];
    }
}
