<?php

use App\Http\Controllers\FrontendController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DivisionController;
use App\Http\Controllers\BichigCatController;
use App\Http\Controllers\BichigTypeController;
use App\Http\Controllers\ZeregController;
use App\Http\Controllers\BichigAngilalController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BichigBarimtController;
use App\Http\Controllers\BichigHariuController;
use App\Http\Controllers\StatisticController;


use Illuminate\Support\Facades\DB;


use App\Models\User;
use App\Models\Division;
use App\Models\BichigCat;
use App\Models\BichigType;
use App\Models\Zereg;
use App\Models\BichigAngilal;
use App\Models\BichigBarimt;
use App\Models\BichigHariu;



































Route::group(['middleware' => ['web', 'auth']], function () {
    Route::post('/logout', [App\Http\Controllers\Auth\LoginController::class, 'logout'])->name('logout');
});

Route::get('/', [FrontendController::class, "showBlade"])->name('home');
Auth::routes(['register' => false, 'verify' => true]);


// Route::get('/home', [App\Http\Controllers\AdminController::class, 'showBlade'])->name('home');
Route::group(['prefix' => 'laravel-filemanager', 'middleware' => ['web', 'auth']], function () {
    \UniSharp\LaravelFilemanager\Lfm::routes();
});



Route::middleware('auth')->get('/get/auth/name', function () {
    return response()->json(['name' => auth()->user()->email ?? null]);
});

Route::middleware('auth')->get('/get/auth/current', function () {
    $u = Auth::user();
    if (!$u) return response()->json(null);
    $d = DB::table('main_division')->where('id', $u->divisionID)->first();
    return response()->json([
        'divisionID' => $u->divisionID,
        'divisionName' => $d->nickName ?? '',
    ]);
});




Route::get("/get/auth", function () {
    $user = new User;
    return $user->getUser();
});
Route::get("/get/auth/name", function () {
    $user = Auth::user();
    return $user ? $user->getUserName() : "Нэвтрээгүй байна";
});

Route::get("/get/divisionName", function () {
    $user = new User;
    return $user->getDivisionName();
});


Route::get('/get/auth/tuvshin', [AuthController::class, 'getTuvshin']);


// Route::get("/get/auth/tuvshin", function () {
//     $user = Auth::user();
//     return $user ? $user->getTuvshin() : "Нэвтрээгүй байна";
// });




Route::post('/change-password', [UserController::class, 'changePassword'])
    ->middleware('auth');




Route::post("/get/byAngiID", [UserController::class, "getAngiID"]);

Route::get("/get/user", function () {
    $user = new User();
    return $user->getUser();
});

Route::post("/new/user", [UserController::class, "NewUser"]);
Route::post("/edit/user", [UserController::class, "EditUser"]);
Route::post("/delete/user", [UserController::class, "DeleteUser"]);

//Хэрэглэгч end


//Бүтцийн нэгж start
Route::get("/get/division", function () {
    $division = new Division();
    return $division->getDivision();
});
// Route::get("/get/comandlal", [DivisionController::class, "getDivision"]);
Route::post("/new/division", [DivisionController::class, "NewDivision"]);
Route::post("/delete/division", [DivisionController::class, "DeleteDivision"]);
Route::post("/edit/division", [DivisionController::class, "EditDivision"]);
//Бүтцийн нэгж end



//Баримт бичиг ангилал (csh_bichig_cat) start
Route::get("/get/bichig/category", function () {
    $bichigCat = new BichigCat();
    return $bichigCat->getBichigCat();
});
Route::post("/new/bichig/category", [BichigCatController::class, "NewBichigCat"])
    ->middleware('auth');
Route::post("/edit/bichig/category", [BichigCatController::class, "EditBichigCat"])
    ->middleware('auth');
Route::post("/delete/bichig/category", [BichigCatController::class, "DeleteBichigCat"])
    ->middleware('auth');
//Баримт бичиг ангилал end

//Баримт бичиг төрөл (csh_bichig_type) start
Route::get("/get/bichig/type", function () {
    $bichigType = new BichigType();
    return $bichigType->getBichigType();
});
Route::post("/new/bichig/type", [BichigTypeController::class, "NewBichigType"])
    ->middleware('auth');
Route::post("/edit/bichig/type", [BichigTypeController::class, "EditBichigType"])
    ->middleware('auth');
Route::post("/delete/bichig/type", [BichigTypeController::class, "DeleteBichigType"])
    ->middleware('auth');
//Баримт бичиг төрөл end

//Бэлэн байдлын зэрэг (csh_belen_baidal) start
Route::get("/get/belen/baidal", function () {
    $zereg = new Zereg();
    return $zereg->getBelenBaidal();
});
Route::post("/new/belen/baidal", [ZeregController::class, "NewBelenBaidal"])
    ->middleware('auth');
Route::post("/edit/belen/baidal", [ZeregController::class, "EditBelenBaidal"])
    ->middleware('auth');
Route::post("/delete/belen/baidal", [ZeregController::class, "DeleteBelenBaidal"])
    ->middleware('auth');
//Бэлэн байдлын зэрэг end

//Баримт бичиг ангилал (csh_bichig_secret) start
Route::get("/get/bichig/angilal", function () {
    $bichigAngilal = new BichigAngilal();
    return $bichigAngilal->getBichigAngilal();
});
Route::post("/new/bichig/angilal", [BichigAngilalController::class, "NewBichigAngilal"])
    ->middleware('auth');
Route::post("/edit/bichig/angilal", [BichigAngilalController::class, "EditBichigAngilal"])
    ->middleware('auth');
Route::post("/delete/bichig/angilal", [BichigAngilalController::class, "DeleteBichigAngilal"])
    ->middleware('auth');
//Баримт бичиг ангилал end

//Баримт бичиг (csh_bichig) start
Route::get("/get/bichig", function (\Illuminate\Http\Request $req) {
    $bichig = new BichigBarimt();
    $filterByDivision = $req->query('source') === 'irsen';
    return $bichig->getBarimtBichig($filterByDivision);
});
Route::post("/new/bichig", [BichigBarimtController::class, "NewBichigBarimt"])
    ->middleware('auth');
Route::post("/edit/bichig", [BichigBarimtController::class, "EditBichigBarimt"])
    ->middleware('auth');
Route::post("/delete/bichig", [BichigBarimtController::class, "DeleteBichigBarimt"])
    ->middleware('auth');
Route::get("/download/ywsan-bichig", [BichigBarimtController::class, "downloadYwsanBichigFile"])
    ->middleware('auth')
    ->name("download.ywsan_bichig");
Route::get("/get/bichig/hariu", function (\Illuminate\Http\Request $req) {
    $bichigID = $req->query('bichigID');
    $hariu = new BichigHariu();
    return $hariu->getByBichigID($bichigID);
})->middleware('auth');
Route::get("/get/bichig/hariu/group", function (\Illuminate\Http\Request $req) {
    $id = $req->query('id');
    if (!$id) return response()->json([]);
    $model = new BichigHariu();
    return $model->getHariuGroup($id);
})->middleware('auth');
Route::post("/new/bichig/hariu", [BichigHariuController::class, "NewBichigHariu"])->middleware('auth');
Route::post("/edit/bichig/hariu", [BichigHariuController::class, "EditBichigHariu"])->middleware('auth');
Route::post("/delete/bichig/hariu", [BichigHariuController::class, "DeleteBichigHariu"])->middleware('auth');
Route::get("/download/hariu-bichig", [BichigHariuController::class, "downloadHariuBichigFile"])
    ->middleware('auth')
    ->name("download.hariu_bichig");
Route::get("/get/bichig/group", function (\Illuminate\Http\Request $req) {
    $id = $req->query('id');
    if (!$id) return response()->json([]);
    $model = new BichigBarimt();
    return $model->getBichigGroup($id);
})->middleware('auth');
//Баримт бичиг ангилал end

// STATISTIC START
Route::post("/get/summary", [StatisticController::class, "summary"]);
Route::post("/get/graphic-year-counts", [StatisticController::class, "graphicYearCounts"]);
Route::post("/get/graphic-year-range-counts", [StatisticController::class, "graphicYearRangeCounts"]);
Route::post("/get/graphic-available-years", [StatisticController::class, "graphicAvailableYears"]);
Route::post("/get/graphic-70year-counts", [StatisticController::class, "graphic70YearCounts"]);
Route::post("/get/monthly-stat", [StatisticController::class, "monthlyStat"]);
Route::post("/get/group-stat", [StatisticController::class, "groupStat"]);
Route::post("/get/ClaccCount", [StatisticController::class, "ClassCount"]);
Route::post("/get/HutheregCount", [StatisticController::class, "HutheregCount"]);


Route::get('/get/DivisionName', function () {
    return DB::table('main_division')->get();
});

//START
Route::post("/get/Hariutai", [StatisticController::class, "HariutaiCount"])->middleware('auth');
Route::post("/get/IrsenBichigBarimt", [StatisticController::class, "IrsenBichigBarimt"])->middleware('auth');
Route::post("/get/HariuguiCount", [StatisticController::class, "HariuguiCount"])->middleware('auth');
Route::post("/get/HugatsaaHetersenCount", [StatisticController::class, "HugatsaaHetersenCount"])->middleware('auth');
Route::post("/get/Usercount", [StatisticController::class, "UserCount"]);
Route::post("/get/uurtirsenbichiCount", [StatisticController::class, "UurtirsenbichiCount"]);

//STATISTIC END




Route::any('{catchall}', [FrontendController::class, "showBlade"])->where('catchall', '.*');
