<?php

namespace Database\Seeders;

use App\Models\Usuario;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Movimientos;
use App\Models\Reto;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (Usuario::count() == 0) {
            Usuario::factory()->admin()->create();
            Usuario::factory()->user()->create();
            Usuario::factory()->count(100)->create();
        }

        if (Movimientos::count() == 0) {
            $usuarios = Usuario::all();
            for ($i = 0; $i < 100; $i++) {
                Movimientos::factory()->create([
                    'usuario_id' => $usuarios->random()->id
                ]);
            }
        }

        if (Reto::count() == 0) {
            $usuarios = Usuario::all();
            for ($i = 0; $i < 100; $i++) {
                Reto::factory()->create([
                    'usuario_id' => $usuarios->random()->id
                ]);
            }
        }
    }
}
