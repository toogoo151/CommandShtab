<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class Division extends Model
{
    use HasFactory;
    protected $table = 'main_division';
    public $timestamps = false;

    public function getDivision()
    {
        try {
            $divisions = DB::table("main_division")
                ->get();
            return $divisions;
        } catch (\Throwable $th) {
            return response(
                array(
                    "status" => "error",
                    "msg" => "Бүтцийн нэгж татаж чадсангүй."
                ),
                500
            );
        }
    }
}
