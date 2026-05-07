<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Miembro extends Model
{
    protected $primaryKey = 'IDmiembro';

    protected $fillable = [
        'IDmiembro',
        'IDforo',
        'IDusuario',
        'created_at'
    ];
}
