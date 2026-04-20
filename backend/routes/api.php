<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactoController;
use App\Http\Controllers\EstadisticasController;
use App\Http\Controllers\MovimientosController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RetoController;

// Login, registro
Route::post('/login', [AuthController::class, 'loginUsuario']);
Route::post('/usuarios', [AuthController::class, 'registroUsuario']);
Route::get('/usuarios', [UsuarioController::class, 'index']);

// Contacto
Route::post('/contacto', [ContactoController::class, 'guardarMensaje']);
Route::get('/contacto', [ContactoController::class, 'verTodos']);


// Rutas protegidas con autenticación
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logoutUsuario']);

    // Usuario
    Route::get('/usuario', [UsuarioController::class, 'listarInfo']);
    Route::put('/usuario', [UsuarioController::class, 'actualizarUsuario']);
    Route::delete('/usuario', [UsuarioController::class, 'borrarUsuario']);

    // Movimientos
    Route::post('/movimiento', [MovimientosController::class, 'apuntarMovimiento']);
    Route::get('/movimientos', [MovimientosController::class, 'listarMovimientos']);
    Route::get('/movimiento', [MovimientosController::class, 'verInfoMovimiento']);
    Route::get('/gastos', [MovimientosController::class, 'listarGastos']);
    Route::get('/ingresos', [MovimientosController::class, 'listarIngresos']);
    Route::put('/movimiento', [MovimientosController::class, 'actualizarMovimiento']);
    Route::delete('movimiento', [MovimientosController::class, 'borrarMovimiento']);

    // Estadisticas
    Route::get('balanceTotal', [EstadisticasController::class, 'balanceTotal']);
    Route::get('gastoMensual', [EstadisticasController::class, 'gastoMensual']);
    Route::get('gastoMensualCat', [EstadisticasController::class, 'gastoMensualPorCategoria']);
    Route::get('ingresoMensual', [EstadisticasController::class, 'ingresoMensual']);
    Route::get('ingresoMensualCat', [EstadisticasController::class, 'ingresoMensualPorCategoria']);

    // Retos
    Route::post('/reto', [RetoController::class, 'crearReto']);
    Route::get('/retos', [RetoController::class, 'listarRetos']);
    Route::get('/reto', [RetoController::class, 'verInfoReto']);
    Route::put('/reto', [RetoController::class, 'actualizarReto']);
    Route::delete('/reto', [RetoController::class, 'borrarReto']);
    Route::post('/reto/aportar', [RetoController::class, 'aportarDinero']);
    Route::post('/reto/retirar', [RetoController::class, 'retirarDinero']);

    // Admin
    Route::get('/admin/usuarios', [AdminController::class, 'listarUsuarios']);
    Route::post('/admin/bloquear', [AdminController::class, 'bloquearUsuario']);
    Route::post('/admin/desbloquear', [AdminController::class, 'desbloquearUsuario']);
    Route::delete('/admin/usuario', [AdminController::class, 'eliminarUsuario']);
});
