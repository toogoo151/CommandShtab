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
    public function UurtirsenbichiCount(Request $req)
    {

        $query = DB::table("csh_bichig")
            ->join("users", "users.id", "=", "csh_bichig.destinationTypeID");

        if ($req->divisionID != 0) {

            $query->where(
                "users.divisionID",
                $req->divisionID
            );
        }

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


    public function HugatsaaHetersenCount(Request $req)
    {

        $query = DB::table("csh_bichig")
            ->join("users", "users.id", "=", "csh_bichig.userID")
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






    /**
     * Yearly counts for Graphic: Bainga (Pie) and Tur (Donut).
     * Filters by harya_on (e.g. "year/2024", "2024") on db_arhivbaingahad and db_arhivhnnuuts.
     */
    public function graphicYearCounts(Request $request)
    {
        $year = (int) $request->year;
        if ($year < 1900 || $year > 2100) {
            return response()->json([
                'baingaIlt' => 0,
                'baingaNuuts' => 0,
                'turIlt' => 0,
                'turNuuts' => 0,
            ]);
        }

        $haryaCondition = function ($q) use ($year) {
            $q->where('harya_on', '=', 'year/' . $year)
                ->orWhere('harya_on', '=', (string) $year);
        };

        $baingaIlt = DB::table('db_arhivbaingahad')
            ->where('user_id', $this->userId())
            ->where('hadgalamj_turul', 0)
            ->where($haryaCondition)
            ->count();

        $baingaNuuts = DB::table('db_arhivhnnuuts')
            ->where('user_id', $this->userId())
            ->where('hn_turul', 0)
            ->where($haryaCondition)
            ->count();

        $turIlt = DB::table('db_arhivbaingahad')
            ->where('user_id', $this->userId())
            ->where('hadgalamj_turul', 2)
            ->where($haryaCondition)
            ->count();

        $turNuuts = DB::table('db_arhivhnnuuts')
            ->where('user_id', $this->userId())
            ->where('hn_turul', 2)
            ->where($haryaCondition)
            ->count();

        return response()->json([
            'baingaIlt' => $baingaIlt,
            'baingaNuuts' => $baingaNuuts,
            'turIlt' => $turIlt,
            'turNuuts' => $turNuuts,
        ]);
    }

    /**
     * Year range counts for Graphic cards.
     * Accepts startYear/endYear and filters by harya_on values like "year/2024" or "2024".
     */
    public function graphicYearRangeCounts(Request $request)
    {
        $startYear = (int) $request->startYear;
        $endYear = (int) $request->endYear;

        if ($startYear < 1900 || $startYear > 2100 || $endYear < 1900 || $endYear > 2100) {
            return response()->json([
                'baingaIlt' => 0,
                'baingaNuuts' => 0,
                'turIlt' => 0,
                'turNuuts' => 0,
            ]);
        }

        if ($startYear > $endYear) {
            [$startYear, $endYear] = [$endYear, $startYear];
        }

        $years = range($startYear, $endYear);
        $haryaOnValues = [];
        foreach ($years as $y) {
            $haryaOnValues[] = 'year/' . $y;
            $haryaOnValues[] = (string) $y;
        }

        $baingaIlt = DB::table('db_arhivbaingahad')
            ->where('user_id', $this->userId())
            ->where('hadgalamj_turul', 0)
            ->whereIn('harya_on', $haryaOnValues)
            ->count();

        $baingaNuuts = DB::table('db_arhivhnnuuts')
            ->where('user_id', $this->userId())
            ->where('hn_turul', 0)
            ->whereIn('harya_on', $haryaOnValues)
            ->count();

        $turIlt = DB::table('db_arhivbaingahad')
            ->where('user_id', $this->userId())
            ->where('hadgalamj_turul', 2)
            ->whereIn('harya_on', $haryaOnValues)
            ->count();

        $turNuuts = DB::table('db_arhivhnnuuts')
            ->where('user_id', $this->userId())
            ->where('hn_turul', 2)
            ->whereIn('harya_on', $haryaOnValues)
            ->count();

        return response()->json([
            'baingaIlt' => $baingaIlt,
            'baingaNuuts' => $baingaNuuts,
            'turIlt' => $turIlt,
            'turNuuts' => $turNuuts,
        ]);
    }

    /**
     * Get available years from harya_on column (distinct years from db_arhivbaingahad and db_arhivhnnuuts).
     * Returns min, max, and all available years.
     */
    public function barimtbichigGraphic(Request $request)
    {

        $baingaYears = DB::table('csh_bichig');
    }

    /**
     * Counts for 70 жил хадгалах: Хүний нөөц (DalanJilHun) and Санхүү (DalanJilSanhuu).
     * Both use db_arhivbaingahad (hadgalamj_turul=1) joined with db_arhivdans.
     * Filter by dans: hadgalah_hugatsaa = '70 жил хадгалагдах' and dans_baidal = 'Хүний нөөц' or 'Санхүү'.
     * Optional: startYear/endYear to filter by harya_on.
     */
    public function graphic70YearCounts(Request $request)
    {
        $startYear = $request->startYear ? (int) $request->startYear : null;
        $endYear = $request->endYear ? (int) $request->endYear : null;

        $baseQuery = function ($dansBaidal) use ($startYear, $endYear) {
            $q = DB::table('db_arhivbaingahad')
                ->join('db_arhivdans', 'db_arhivdans.id', '=', 'db_arhivbaingahad.dans_id')
                ->where('db_arhivbaingahad.user_id', $this->userId())
                ->where('db_arhivbaingahad.hadgalamj_turul', 1)
                ->where('db_arhivdans.hadgalah_hugatsaa', '70 жил хадгалагдах')
                ->where('db_arhivdans.dans_baidal', $dansBaidal);

            if ($startYear !== null && $endYear !== null && $startYear >= 1900 && $endYear <= 2100) {
                if ($startYear > $endYear) {
                    [$startYear, $endYear] = [$endYear, $startYear];
                }
                $years = range($startYear, $endYear);
                $haryaOnValues = [];
                foreach ($years as $y) {
                    $haryaOnValues[] = 'year/' . $y;
                    $haryaOnValues[] = (string) $y;
                }
                $q->whereIn('db_arhivbaingahad.harya_on', $haryaOnValues);
            }

            return $q->count();
        };

        return response()->json([
            'dalanJilHun' => $baseQuery('Хүний нөөц'),
            'dalanJilSanhuu' => $baseQuery('Санхүү'),
        ]);
    }
}
