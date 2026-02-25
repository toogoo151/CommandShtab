<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BichigBarimt extends Model
{
    use HasFactory;

    protected $table = 'csh_bichig';
    public $timestamps = true;

    protected $fillable = [
        'userID',
        'hariutaiEseh',
        'catID',
        'typeID',
        'secretID',
        'level',
        'belenBaidalID',
        'sourceTypeID',
        'destinationTypeID',
        'dugaar',
        'aguulga',
        'pdf',
        'fileSize',
        'ognoo',
        'hariuOgnoo',
        'hugatsaaHetersen',
        'description',
    ];

    protected $casts = [
        'ognoo' => 'datetime',
    ];

    /**
     * Баримт бичгийн жагсаалтыг буцаана.
     * @param string|false $sourceFilter 'irsen' = Ирсэн: destinationTypeID=divisionID; 'ywsan' = Явсан (userType=2 админд): sourceTypeID=divisionID
     */
    public function getBarimtBichig($sourceFilter = false)
    {
        try {
            $query = DB::table('csh_bichig')
                ->leftJoin('csh_bichig_cat', 'csh_bichig_cat.id', '=', 'csh_bichig.catID')
                ->leftJoin('csh_bichig_type', 'csh_bichig_type.id', '=', 'csh_bichig.typeID')
                ->leftJoin('csh_bichig_secret', 'csh_bichig_secret.id', '=', 'csh_bichig.secretID')
                ->leftJoin('csh_belen_baidal', 'csh_belen_baidal.id', '=', 'csh_bichig.belenBaidalID')
                ->leftJoin('main_division as source_division', 'source_division.id', '=', 'csh_bichig.sourceTypeID')
                ->leftJoin('main_division as dest_division', 'dest_division.id', '=', 'csh_bichig.destinationTypeID');

            if (Auth::check()) {
                $divisionID = Auth::user()->divisionID ?? null;
                $userType = Auth::user()->userType ?? Auth::user()->user_type ?? null;
                if ($divisionID !== null) {
                    if ($sourceFilter === 'irsen') {
                        $query->where('csh_bichig.destinationTypeID', $divisionID);
                    } elseif ($sourceFilter === 'ywsan' && (int) $userType === 2) {
                        $query->where('csh_bichig.sourceTypeID', $divisionID);
                    }
                }
            }

            return $query
                ->orderBy('csh_bichig.id', 'DESC')
                ->select(
                    'csh_bichig.*',
                    'csh_bichig_cat.catName',
                    'csh_bichig_type.typeName',
                    'csh_bichig_secret.secretName',
                    'csh_belen_baidal.belenBaidalName',
                    'source_division.nickName as sourceTypeName',
                    'dest_division.nickName as destinationTypeName'
                )
                ->get();
        } catch (\Throwable $th) {
            return response(
                [
                    'status' => 'error',
                    'msg' => 'Татаж чадсангүй.',
                ],
                500
            );
        }
    }

    /**
     * Явсан бичиг: нэг бичгийн бүлэг (ижил dugaar, ognoo, sourceTypeID, aguulga) бүх мөрийг буцаана.
     */
    public function getBichigGroup($id)
    {
        $row = self::find($id);
        if (!$row) {
            return collect([]);
        }
        return self::where('dugaar', $row->dugaar)
            ->where('ognoo', $row->ognoo)
            ->where('sourceTypeID', $row->sourceTypeID)
            ->where('aguulga', $row->aguulga)
            ->orderBy('id')
            ->get();
    }
}
