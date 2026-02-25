<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/



// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

Route::middleware('web')->group(function () {
    Route::post('/login', [App\Http\Controllers\AuthController::class, 'login']);
    Route::post('/logout', [App\Http\Controllers\AuthController::class, 'logout'])->middleware('auth');
});
Route::post('/information/viewed', 'InformationController@logViewedInformation');
Route::post('/information/changed', 'InformationController@logChangedInformation');

Route::middleware('auth:api')->get('/notifications', function (Request $request) {
    return $request->user()->unreadNotifications;
});

Route::middleware('auth:api')->post('/notifications/read', function (Request $request) {
    $request->user()->unreadNotifications->markAsRead();
    return response()->json(['message' => 'Marked as read']);
});
