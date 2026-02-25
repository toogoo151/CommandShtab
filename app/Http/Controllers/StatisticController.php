<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;




class StatisticController extends Controller
{
    private function userId()
    {
        // All statistic endpoints should be user-scoped (auth middleware required)
        return Auth::id();
    }


    public function BelenzeregCount(Request $req)
    {

        $query = DB::table("csh_bichig")
            ->join(
                "csh_belen_baidal",
                "csh_belen_baidal.id",
                "=",
                "csh_bichig.belenBaidalID"
            );

        if ($req->divisionID != 0) {

            $query->join(
                "users",
                "users.id",
                "=",
                "csh_bichig.userID"
            )
                ->where(
                    "users.divisionID",
                    $req->divisionID
                );
        }

        return $query
            ->select(
                "csh_belen_baidal.id",
                "csh_belen_baidal.belenBaidalName",
                DB::raw("COUNT(csh_bichig.id) as total")
            )
            ->groupBy(
                "csh_belen_baidal.id",
                "csh_belen_baidal.belenBaidalName"
            )
            ->get();
    }

    public function HetersenHugatsaa(Request $req)
    {
        $query = DB::table("csh_bichig")
            ->join("users", "users.id", "=", "csh_bichig.userID")
            ->join("main_division", "main_division.id", "=", "users.divisionID")
            ->select(
                "main_division.id",
                "main_division.nickName",
                DB::raw("SUM(csh_bichig.hugatsaaHetersen) as total")
            )
            ->groupBy(
                "main_division.id",
                "main_division.nickName"
            );

        return $query->get();
    }

    public function BichigTypeCount(Request $req)
    {

        $query = DB::table("csh_bichig")
            ->join(
                "csh_bichig_type",
                "csh_bichig_type.id",
                "=",
                "csh_bichig.typeID"
            );

        if ($req->divisionID != 0) {

            $query->join(
                "users",
                "users.id",
                "=",
                "csh_bichig.userID"
            )
                ->where(
                    "users.divisionID",
                    $req->divisionID
                );
        }

        return $query
            ->select(
                "csh_bichig_type.id",
                "csh_bichig_type.typeName",
                DB::raw("COUNT(csh_bichig.id) as total")
            )
            ->groupBy(
                "csh_bichig_type.id",
                "csh_bichig_type.typeName"
            )
            ->get();
    }



    public function UserCount(Request $req)
    {

        $query = DB::table("users");

        if ($req->divisionID != 0) {

            $query->where(
                "divisionID",
                $req->divisionID
            );
        }

        return $query->count();
    }

    public function HugatsaaHetersen(Request $req)
    {
        $query = DB::table("csh_bichig")
            ->join("users", "users.id", "=", "csh_bichig.userID");

        if ($req->divisionID != 0) {
            $query->where("users.divisionID", $req->divisionID);
        }

        return $query->sum("csh_bichig.hugatsaaHetersen");
    }
    public function HariutaiCount(Request $req)
    {

        $query = DB::table("csh_bichig")
            ->join("users", "users.id", "=", "csh_bichig.userID")
            ->where("hariutaiEseh", 2);

        if ($req->divisionID != 0) {

            $query->where(
                "users.divisionID",
                $req->divisionID
            );
        }

        return $query->count();
    }

    public function HariuguiCount(Request $req)
    {

        $query = DB::table("csh_bichig")
            ->join("users", "users.id", "=", "csh_bichig.userID")
            ->where("hariutaiEseh", 1);

        if ($req->divisionID != 0) {

            $query->where(
                "users.divisionID",
                $req->divisionID
            );
        }

        return $query->count();
    }


    public function IrsenBichigBarimt(Request $req)
    {

        $query = DB::table("csh_bichig")
            ->join("users", "users.id", "=", "csh_bichig.userID");

        if ($req->divisionID != 0) {

            $query->where(
                "users.divisionID",
                $req->divisionID
            );
        }

        return $query->count();
    }

    public function JishigIrsenBichigBarimt(Request $req)
    {

        $query = DB::table("csh_bichig")
            ->join("users", "users.id", "=", "csh_bichig.userID");

        return $query->count();
    }


    public function HariutaiIrsenCount(Request $req)
    {
        $query = DB::table("csh_bichig")
            ->join(
                "main_division",
                "main_division.id", // users-ийн primary key
                "=",
                "csh_bichig.destinationTypeID" // csh_bichig-д байгаа user холбоос
            )
            ->where("hariutaiEseh", 2);

        if ($req->divisionID != 0) {
            $query->where(
                "csh_bichig.destinationTypeID",
                $req->divisionID
            );
        }

        return $query->count();
    }
    // {
    //     $query = DB::table("csh_bichig")
    //         ->where("hariutaiEseh", 2); // 2 = Хариутай

    //     if ($req->divisionID != 0) {
    //         // Хэрэв divisionID шаардлагатай бол join ашиглана
    //         $query->join("users", "users.id", "=", "csh_bichig.userID")
    //             ->where("users.divisionID", $req->divisionID);
    //     }

    //     return $query->count();
    // }

    public function HariuguiIrsenCount(Request $req)
    { {
            $query = DB::table("csh_bichig")
                ->join(
                    "main_division",
                    "main_division.id",
                    "=",
                    "csh_bichig.destinationTypeID"
                )
                ->where("hariutaiEseh", 1);

            if ($req->divisionID != 0) {
                $query->where(
                    "csh_bichig.destinationTypeID",
                    $req->divisionID
                );
            }

            return $query->count();
        }
    }
    public function UurtirsenbichiCount(Request $req)
    {

        $query = DB::table("csh_bichig")
            ->join(
                "main_division",
                "main_division.id",
                "=",
                "csh_bichig.destinationTypeID"
            );
        // ->join("users", "users.id", "=", "csh_bichig.userID");

        if ($req->divisionID != 0) {
            $query->where("csh_bichig.destinationTypeID", $req->divisionID);
        }

        return $query->count();
    }

    public function JishigUurtirsenbichiCount(Request $req)
    {

        $query = DB::table("csh_bichig")
            ->join(
                "main_division",
                "main_division.id",
                "=",
                "csh_bichig.destinationTypeID"
            );


        return $query->count();
    }

    public function HariuIrsenCount(Request $req)
    {
        $query = DB::table("csh_bichig")
            ->join(
                "csh_bichig_hariu",
                "csh_bichig_hariu.bichigID",
                "=",
                "csh_bichig.id"
            )
            ->join("users", "users.id", "=", "csh_bichig.userID");

        if ($req->divisionID != 0) {
            $query->where("users.divisionID", $req->divisionID);
        }


        $count = $query->distinct("csh_bichig.id")->count("csh_bichig.id");

        return $count;
    }

    public function DivisionCompareGraphic(Request $req)
    {

        // =================
        // ALL DIVISION
        // =================

        $divisions = DB::table("main_division")

            ->select("id", "nickName")

            ->get();


        // =================
        // IRСЭН
        // =================

        $irsen = DB::table("csh_bichig")

            ->select(

                "destinationTypeID",

                DB::raw("COUNT(id) as irsen")

            )

            ->groupBy("destinationTypeID")

            ->get()

            ->keyBy("destinationTypeID");


        // =================
        // YAVSAN
        // =================

        $yavsan = DB::table("csh_bichig")

            ->join(

                "users",

                "users.id",

                "=",

                "csh_bichig.userID"

            )

            ->select(

                "users.divisionID",

                DB::raw("COUNT(csh_bichig.id) as yavsan")

            )

            ->groupBy("users.divisionID")

            ->get()

            ->keyBy("divisionID");


        // =================
        // MERGE
        // =================

        $result = [];

        foreach ($divisions as $division) {

            $result[] = [

                "name" => $division->nickName,

                "ирсэн" => $irsen[$division->id]->irsen ?? 0,

                "явсан" => $yavsan[$division->id]->yavsan ?? 0,

            ];
        }

        return response()->json($result);
    }
    public function DivisionHetersenGraphic(Request $req)
    {

        $data = DB::table("csh_bichig")

            ->join(
                "main_division",
                "main_division.id",
                "=",
                "csh_bichig.destinationTypeID"
            )

            ->select(

                "main_division.nickName as name",

                DB::raw("
                SUM(
                    IFNULL(csh_bichig.hugatsaaHetersen,0)
                ) as хэтэрсэн
            ")

            )

            ->groupBy("main_division.nickName")

            ->get();


        return response()->json($data);
    }



    public function HugatsaaHetersenCount(Request $req)
    {

        $query = DB::table("csh_bichig")
            ->join("users", "users.id", "=", "csh_bichig.destinationTypeID")
            ->where("hariutaiEseh", 2)
            ->whereRaw("
TIMESTAMPDIFF(
MINUTE,
ognoo,
NOW()
) > hariuOgnoo
");

        if ($req->divisionID != 0) {

            $query->where(
                "users.divisionID",
                $req->divisionID
            );
        }

        return $query->count();
    }
}
