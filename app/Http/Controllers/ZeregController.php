<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Zereg;
use Illuminate\Http\Request;

class ZeregController extends Controller
{
    public function NewBelenBaidal(Request $req)
    {
        try {
            $insert = new Zereg();
            $insert->belenBaidalName = $req->belenBaidalName;
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

    public function DeleteBelenBaidal(Request $req)
    {
        try {
            $delete = Zereg::find($req->id);
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

    public function EditBelenBaidal(Request $req)
    {
        try {
            $edit = Zereg::find($req->id);
            $edit->belenBaidalName = $req->belenBaidalName;
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
