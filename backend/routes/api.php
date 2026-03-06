<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MovimientosController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RetoController;

// Login, registro
Route::post('/login', [AuthController::class, 'loginUsuario']);
Route::post('/usuarios', [AuthController::class, 'registroUsuario']);
Route::get('/usuarios', [UsuarioController::class, 'index']);

// Rutas protegidas con autenticación
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logoutUsuario']);

    // Usuario
    Route::get('/usuario', [UsuarioController::class, 'listarInfo']);
    Route::put('/usuario', [UsuarioController::class, 'actualizarUsuario']);
    Route::delete('/usuario', [UsuarioController::class, 'borrarUsuario']);

    // Movimientos
    Route::post('/movimiento', [MovimientosController::class, 'apuntarMovimiento']);
    Route::get('/movimientos', [MovimientosController::class, 'mostrarMovimientos']);
    Route::get('/movimiento', [MovimientosController::class, 'verInfoMovimiento']);
    Route::put('/movimiento', [MovimientosController::class, 'actualizarMovimiento']);
    Route::delete('movimiento', [MovimientosController::class, 'borrarMovimiento']);

    // Esta línea conecta la URL /api/retos con la función store del controlador
    Route::post('/retos', [RetoController::class, 'store']);
    Route::get('/retos/{id}', [RetoController::class, 'show']);
    Route::get('/retos', [RetoController::class, 'index']);
});
