<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Votos_Respuesta extends Model
{
    protected $table = 'votos_respuestas';

    protected $primaryKey = 'IDvoto';

    protected $fillable = [
        'IDvoto',
        'IDusuario',
        'IDrespuesta'
    ];
}
