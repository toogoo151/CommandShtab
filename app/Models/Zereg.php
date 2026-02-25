<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Zereg extends Model
{
    use HasFactory;

    protected $table = 'csh_belen_baidal';
    public $timestamps = false;
    protected $fillable = ['belenBaidalName', 'description'];

    public function getBelenBaidal()
    {
        try {
            return DB::table($this->table)
                ->orderBy('id', 'DESC')
                ->get();
        } catch (\Throwable $th) {
            return response([
                'status' => 'error',
                'msg' => 'Бэлэн байдлын зэрэг татаж чадсангүй.',
            ], 500);
        }
    }
}
