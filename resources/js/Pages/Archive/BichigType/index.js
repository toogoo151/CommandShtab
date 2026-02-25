import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "../../../../styles/muidatatable.css";
import axios from "../../../AxiosUser";
import CustomToolbar from "../../../components/Admin/general/MUIDatatable/CustomToolbar";
import MUIDatatable from "../../../components/Admin/general/MUIDatatable/MUIDatatable";
import BichigTypeEdit from "./BichigTypeEdit";
import BichigTypeNew from "./BichigTypeNew";

const BichigTypeIndex = () => {
    const [getData, setData] = useState([]);
    const [getRowsSelected, setRowsSelected] = useState([]);
    const [clickedRowData, setclickedRowData] = useState([]);
    const [isEditBtnClick, setIsEditBtnClick] = useState(false);
    const [showModal] = useState("modal");

    useEffect(() => {
        refreshData();
    }, []);

    useEffect(() => {
        if (getRowsSelected[0] != undefined) {
            setIsEditBtnClick(false);
            setclickedRowData(getData[getRowsSelected[0]]);
        }
    }, [getRowsSelected]);

    const refreshData = () => {
        axios
            .get("/get/bichig/type")
            .then((res) => {
                setRowsSelected([]);
                setData(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const btnDelete = () => {
        setRowsSelected([]);
        if (getData[getRowsSelected[0]]?.id != null) {
            Swal.fire({
                title: "Та устгахдаа итгэлтэй байна уу?",
                showCancelButton: true,
                confirmButtonText: `Тийм`,
                cancelButtonText: `Үгүй`,
            }).then((result) => {
                if (result.isConfirmed) {
                    axios
                        .post("/delete/bichig/type", {
                            id: getData[getRowsSelected[0]].id,
                        })
                        .then((res) => {
                            Swal.fire(res.data.msg);
                            refreshData();
                        })
                        .catch((err) => {
                            Swal.fire(
                                err.response?.data?.msg || "Алдаа гарлаа."
                            );
                        });
                }
            });
        }
    };

    const btnEdit = () => {
        setIsEditBtnClick(true);
    };

    return (
        <>
            <div className="row">
                <div className="info-box">
                    <div className="col-md-12">
                        <h1 className="text-center mb-4">
                            Баримт бичгийн төрөл
                        </h1>
                        <MUIDatatable
                            data={getData}
                            setdata={setData}
                            columns={columns}
                            costumToolbar={
                                <CustomToolbar
                                    btnClassName={"btn btn-success"}
                                    modelType={"modal"}
                                    dataTargetID={"#bichigTypeNew"}
                                    spanIconClassName={"fas fa-solid fa-plus"}
                                    buttonName={"Нэмэх"}
                                    excelDownloadData={getData}
                                    excelHeaders={excelHeaders}
                                    isHideInsert={true}
                                />
                            }
                            btnEdit={btnEdit}
                            modelType={showModal}
                            editdataTargetID={"#bichigTypeEdit"}
                            btnDelete={btnDelete}
                            avgColumnIndex={-1}
                            avgColumnName={"email"}
                            avgName={"Дундаж: "}
                            getRowsSelected={getRowsSelected}
                            setRowsSelected={setRowsSelected}
                            isHideDelete={true}
                            isHideEdit={true}
                        />
                        <BichigTypeNew refreshData={refreshData} />
                        <BichigTypeEdit
                            setRowsSelected={setRowsSelected}
                            refreshData={refreshData}
                            changeDataRow={clickedRowData}
                            isEditBtnClick={isEditBtnClick}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default BichigTypeIndex;

const columns = [
    {
        name: "id",
        label: "№",
        options: {
            filter: false,
            sort: true,
            align: "center",
            customBodyRenderLite: (rowIndex) => rowIndex + 1,
            setCellProps: () => ({ align: "center" }),
            setCellHeaderProps: () => ({
                style: {
                    backgroundColor: "#5DADE2",
                    color: "white",
                    width: 50,
                },
            }),
        },
    },
    {
        name: "typeName",
        label: "Төрөл нэр",
        options: {
            filter: true,
            sort: true,
            setCellHeaderProps: () => ({
                style: { backgroundColor: "#5DADE2", color: "white" },
            }),
        },
    },
    {
        name: "description",
        label: "Тайлбар",
        options: {
            filter: true,
            sort: false,
            setCellHeaderProps: () => ({
                style: { backgroundColor: "#5DADE2", color: "white" },
            }),
        },
    },
];

const excelHeaders = [
    { label: "Төрөл нэр", key: "typeName" },
    { label: "Тайлбар", key: "description" },
];
