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

    public function run(): void
    {
        if (Usuario::count() == 0) {
            Usuario::factory()->admin()->create();
            Usuario::factory()->user()->create();
            Usuario::factory()->count(10)->create();
        }

        $usuarios = Usuario::all();

        if (Movimientos::count() == 0) {
            foreach ($usuarios as $usuario) {
                Movimientos::factory()->count(50)->create([
                    'usuario_id' => $usuario->IDusuario
                ]);
            }
        }

        if (Reto::count() == 0) {
            foreach ($usuarios as $usuario) {
                Reto::factory()->count(20)->create([
                    'usuario_id' => $usuario->IDusuario
                ]);
            }
        }
    }
}
