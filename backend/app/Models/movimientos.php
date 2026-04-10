<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

class Movimientos extends Model
{
    use HasFactory, Notifiable;

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
