<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Reto extends Model
{
    use HasFactory;

    // Indica el nombre exacto de la tabla en la DB
    protected $table = 'retos';

    //Define la clave primaria personalizada (por defecto Laravel busca id)
    protected $primaryKey = 'IDreto';

    // Campos que permite llenar masivamente desde el formulario/API
    protected $fillable = [
        'titulo',    
        'activo',
        'cumplido',
        'cantidad',
        'fecha_inicio',
        'fecha_final',
        //'duracion',
        'IDusuario',
        'user_id'
    ];

    /**
     * Relación: Un Reto pertenece a un Usuario.
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'IDusuario', 'IDusuario');
    }
}
