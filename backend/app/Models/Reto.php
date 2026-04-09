<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Reto extends Model
{
    use HasFactory;

    protected $table = 'retos';
    protected $primaryKey = 'IDreto';

    protected $fillable = [
        'titulo',
        'cantidad',
        'cantidad_actual',
        'fecha_inicio',
        'fecha_final',
        'cumplido',
        'activo',
        'usuario_id'
    ];

    protected $attributes = [
        'cumplido' => false,
        'activo' => true,
        'cantidad_actual' => 0,
    ];
}
