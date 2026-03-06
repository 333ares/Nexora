<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Movimientos extends Model
{
    protected $fillable = [
        'id',
        'tipo',
        'cantidad',
        'categoria',
        'fecha',
        'descripcion',
        'usuario_id'
    ];
}
