<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class BichigCat extends Model
{
    use HasFactory;

    protected $table = 'csh_bichig_cat';
    public $timestamps = false;
    protected $fillable = ['catName', 'description'];

    public function getBichigCat()
    {
        try {
            return DB::table($this->table)
                ->orderBy('id', 'DESC')
                ->get();
        } catch (\Throwable $th) {
            return response([
                'status' => 'error',
                'msg' => 'Баримт бичиг татаж чадсангүй.',
            ], 500);
        }
    }
}
