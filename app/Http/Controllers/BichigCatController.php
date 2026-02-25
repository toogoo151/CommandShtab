<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BichigCat;
use Illuminate\Http\Request;

class BichigCatController extends Controller
{
    public function NewBichigCat(Request $req)
    {
        try {
            $insert = new BichigCat();
            $insert->catName = $req->catName;
            $insert->description = $req->description ?? null;
            $insert->save();
            return response([
                'status' => 'success',
                'msg' => 'Амжилттай хадгаллаа.',
            ], 200);
        } catch (\Throwable $th) {
            return response([
                'status' => 'error',
                'msg' => 'Алдаа гарлаа.',
            ], 500);
        }
    }

    public function DeleteBichigCat(Request $req)
    {
        try {
            $delete = BichigCat::find($req->id);
            $delete->delete();
            return response([
                'status' => 'success',
                'msg' => 'Амжилттай устгалаа.',
            ], 200);
        } catch (\Throwable $th) {
            return response([
                'status' => 'error',
                'msg' => 'Алдаа гарлаа.',
            ], 500);
        }
    }

    public function EditBichigCat(Request $req)
    {
        try {
            $edit = BichigCat::find($req->id);
            $edit->catName = $req->catName;
            $edit->description = $req->description ?? null;
            $edit->save();
            return response([
                'status' => 'success',
                'msg' => 'Амжилттай заслаа.',
            ], 200);
        } catch (\Throwable $th) {
            return response([
                'status' => 'error',
                'msg' => 'Алдаа гарлаа.',
            ], 500);
        }
    }
}
