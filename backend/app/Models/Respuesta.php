<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Respuesta extends Model
{

    protected $primaryKey = 'IDrespuesta';

    protected $fillable = [
        'IDrespuesta',
        'respuesta',
        'IDusuario',
        'IDforo',
        'created_at'
    ];
}
