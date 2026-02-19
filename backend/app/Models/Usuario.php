<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Usuario extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'usuario',
        'linkedin',
        'nombre',
        'apellidos',
        'balance_total',
        'email',
        'password',
        'estado',
        'rango',
        'rol'
    ];

    protected $attributes = [
        'linkedin' => '-',
        'balance_total' => 0.0,
        'estado' => 'activo',
        'rango' => '-',
        'rol' => 'usuario'
    ];
}
