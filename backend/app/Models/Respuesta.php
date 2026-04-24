<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Respuesta extends Model
{
    protected $fillable = [
        'IDrespuesta',
        'respuesta',
        'IDusuario',
        'IDpregunta',
        'created_at'
    ];
}
