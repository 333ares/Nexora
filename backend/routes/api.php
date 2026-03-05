<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MovimientosController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;

// Login, registro y logout
Route::post('/login', [AuthController::class, 'loginUsuario']);
Route::post('/usuario', [AuthController::class, 'registroUsuario']);

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
    Route::put('/movimiento', [MovimientosController::class, 'actualizarMovimiento']);
    Route::delete('movimiento', [MovimientosController::class, 'borrarMovimiento']);
});
