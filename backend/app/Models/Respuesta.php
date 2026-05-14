<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Respuesta extends Model
{
    use HasFactory;

    protected $primaryKey = 'IDrespuesta';

    protected $fillable = [
        'IDrespuesta',
        'respuesta',
        'IDusuario',
        'IDforo',
        'created_at'
    ];
}
