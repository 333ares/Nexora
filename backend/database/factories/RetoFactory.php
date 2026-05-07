<?php

namespace Database\Factories;

use App\Models\Reto;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Reto>
 */
class RetoFactory extends Factory
{
    protected $model = Reto::class;
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $fechaInicio = $this->faker->dateTimeBetween('-1 month', 'now');
        $fechaFinal = $this->faker->dateTimeBetween($fechaInicio, '+3 months');

        return [
            'titulo' => $this->faker->sentence(3),
            'cantidad' => $this->faker->numberBetween(10, 1000),
            'cantidad_actual' => $this->faker->numberBetween(0, 50), // Menor o igual a cantidad, pero para simplicidad
            'fecha_inicio' => $fechaInicio,
            'fecha_final' => $fechaFinal,
            'cumplido' => $this->faker->boolean(20), // 20% de cumplido
            'activo' => $this->faker->boolean(90), // 90% de activo
        ];
    }
}
