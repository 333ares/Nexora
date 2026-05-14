<?php

namespace Database\Seeders;

use App\Models\Usuario;
use App\Models\Movimientos;
use App\Models\Reto;
use App\Models\Foro;
use App\Models\Respuesta;
use App\Models\VotosRespuesta;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // --- Usuarios ---
        if (Usuario::count() == 0) {
            Usuario::factory()->admin()->create();
            Usuario::factory()->user()->create();
            Usuario::factory()->count(10)->create();
        }

        $usuarios = Usuario::all();

        // --- Movimientos ---
        if (Movimientos::count() == 0) {
            foreach ($usuarios as $usuario) {
                Movimientos::factory()->count(50)->create([
                    'usuario_id' => $usuario->IDusuario,
                ]);
            }
        }

        // --- Retos ---
        if (Reto::count() == 0) {
            foreach ($usuarios as $usuario) {
                Reto::factory()->count(20)->create([
                    'usuario_id' => $usuario->IDusuario,
                ]);
            }
        }

        // --- Foros ---
        if (Foro::count() == 0) {
            foreach ($usuarios as $usuario) {
                // Cada usuario crea 3 foros
                $foros = Foro::factory()->count(3)->create([
                    'IDusuario' => $usuario->IDusuario,
                ]);

                // El creador es miembro automáticamente
                foreach ($foros as $foro) {
                    \DB::table('miembros')->insert([
                        'IDforo'     => $foro->IDforo,
                        'IDusuario'  => $usuario->IDusuario,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // --- Miembros (otros usuarios se unen a foros ajenos) ---
            $foros = Foro::all();
            foreach ($foros as $foro) {
                // 4 usuarios aleatorios se unen a cada foro (sin repetir al creador)
                $otrosUsuarios = $usuarios->where('IDusuario', '!=', $foro->IDusuario)
                                          ->random(min(4, $usuarios->count() - 1));

                foreach ($otrosUsuarios as $usuario) {
                    $yaEsMiembro = \DB::table('miembros')
                        ->where('IDforo', $foro->IDforo)
                        ->where('IDusuario', $usuario->IDusuario)
                        ->exists();

                    if (!$yaEsMiembro) {
                        \DB::table('miembros')->insert([
                            'IDforo'     => $foro->IDforo,
                            'IDusuario'  => $usuario->IDusuario,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }

            // --- Respuestas ---
            foreach ($foros as $foro) {
                // Los miembros del foro responden
                $miembros = \DB::table('miembros')
                    ->where('IDforo', $foro->IDforo)
                    ->pluck('IDusuario');

                foreach ($miembros as $IDusuario) {
                    Respuesta::factory()->count(2)->create([
                        'IDforo'    => $foro->IDforo,
                        'IDusuario' => $IDusuario,
                    ]);
                }
            }

            // --- Votos (cada usuario vota respuestas ajenas, 1 voto por respuesta) ---
            $respuestas = Respuesta::all();
            foreach ($usuarios as $usuario) {
                // Vota hasta 10 respuestas ajenas aleatorias
                $candidatas = $respuestas->where('IDusuario', '!=', $usuario->IDusuario)
                                         ->random(min(10, $respuestas->count()));

                foreach ($candidatas as $respuesta) {
                    $yaVoto = \DB::table('votos_respuestas')
                        ->where('IDusuario', $usuario->IDusuario)
                        ->where('IDrespuesta', $respuesta->IDrespuesta)
                        ->exists();

                    if (!$yaVoto) {
                        \DB::table('votos_respuestas')->insert([
                            'IDrespuesta' => $respuesta->IDrespuesta,
                            'IDusuario'   => $usuario->IDusuario,
                            'created_at'  => now(),
                            'updated_at'  => now(),
                        ]);
                    }
                }
            }
        }
    }
}