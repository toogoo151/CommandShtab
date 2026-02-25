<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('csh_bichig_hariu')) {
            return;
        }
        Schema::create('csh_bichig_hariu', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('bichigID');
            $table->unsignedBigInteger('sourceTypeID')->nullable()->comment('Нэвтэрсэн админы divisionID');
            $table->unsignedBigInteger('destinationTypeID')->nullable();
            $table->string('dugaar')->nullable();
            $table->text('aguulga')->nullable();
            $table->text('pdf')->nullable();
            $table->unsignedInteger('fileSize')->nullable();
            $table->date('ognoo')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
            $table->foreign('bichigID')->references('id')->on('csh_bichig')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('csh_bichig_hariu');
    }
};
