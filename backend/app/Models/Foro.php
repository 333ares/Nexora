<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Foro extends Model
{
    use HasFactory;

    protected $fillable = [
        'IDforo',
        'titulo',
        'contenido',
        'IDusuario',
        'created_at'
    ];
}
