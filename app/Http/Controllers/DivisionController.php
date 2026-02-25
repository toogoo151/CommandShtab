<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Division;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Redirect, Response, File;
use Illuminate\Support\Str;


class DivisionController extends Controller
{
    public function getDivision()
    {

        $division = DB::table("main_division")
            ->get();

        return response()->json($division);
    }


    public function NewDivision(Request $req)
    {
        try {
            $insertDivision = new Division();
            $insertDivision->nickName = $req->nickName;
            $insertDivision->fullName = $req->fullName;
            $insertDivision->description = $req->description;
            $insertDivision->save();
            return response(
                array(
                    "status" => "success",
                    "msg" => "Амжилттай хадгаллаа."
                ),
                200
            );
        } catch (\Throwable $th) {
            return response(
                array(
                    "status" => "error",
                    "msg" => "Алдаа гарлаа."
                ),
                500
            );
        }
    }
    public function DeleteDivision(Request $req)
    {
        try {
            $delete = Division::find($req->id);
            $delete->delete();
            return response(
                array(
                    "status" => "success",
                    "msg" => "Амжилттай устгалаа."
                ),
                200
            );
        } catch (\Throwable $th) {
            return response(
                array(
                    "status" => "error",
                    "msg" => "Алдаа гарлаа."
                ),
                500
            );
        }
    }

    public function EditDivision(Request $req)
    {
        try {
            $edit = Division::find($req->id);
            $edit->nickName = $req->nickName;
            $edit->fullName = $req->fullName;
            $edit->description = $req->description;
            $edit->save();
            return response(
                array(
                    "status" => "success",
                    "msg" => "Амжилттай заслаа."
                ),
                200
            );
        } catch (\Throwable $th) {
            return response(
                array(
                    "status" => "error",
                    "msg" => "Алдаа гарлаа."
                ),
                500
            );
        }
    }
}
