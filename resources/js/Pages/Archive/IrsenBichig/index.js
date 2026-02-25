import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import "../../../../styles/muidatatable.css";
import axios from "../../../AxiosUser";
import CustomToolbar from "../../../components/Admin/general/MUIDatatable/CustomToolbar";
import MUIDatatable from "../../../components/Admin/general/MUIDatatable/MUIDatatable";
import HariuNew from "./HariuNew";
import HariuEdit from "./HariuEdit";

const STATUS_OVERDUE = "overdue";
const STATUS_WARNING = "warning";
const STATUS_NORMAL = "normal";

function getRowStatus(row) {
    if (row.hariutaiEseh != 2) return STATUS_NORMAL;
    const mins = Number(row.hariuOgnoo);
    if (!Number.isFinite(mins) || mins <= 0) return STATUS_NORMAL;
    const ognooStr = row.ognoo;
    if (!ognooStr) return STATUS_NORMAL;
    const start = new Date(ognooStr).getTime();
    const deadline = start + mins * 60 * 1000;
    const threshold80 = start + 0.8 * mins * 60 * 1000;
    const now = Date.now();
    if (now > deadline) return STATUS_OVERDUE;
    if (now >= threshold80) return STATUS_WARNING;
    return STATUS_NORMAL;
}

function sortOrder(status) {
    if (status === STATUS_OVERDUE) return 0;
    if (status === STATUS_WARNING) return 1;
    return 2;
}

const normalize = (res) => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);

const IrsenBichigIndex = () => {
    const [getData, setData] = useState([]);
    const [getRowsSelected, setRowsSelected] = useState([]);
    const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
    const [previewFileName, setPreviewFileName] = useState("");

    const [hariuData, setHariuData] = useState([]);
    const [hariuRowsSelected, setHariuRowsSelected] = useState([]);
    const [clickedHariuRow, setClickedHariuRow] = useState(null);
    const [isHariuEditBtnClick, setIsHariuEditBtnClick] = useState(false);

    const [types, setTypes] = useState([]);
    const [secrets, setSecrets] = useState([]);
    const [belenBaidal, setBelenBaidal] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [filterHariutaiEseh, setFilterHariutaiEseh] = useState("");
    const [filterTypeID, setFilterTypeID] = useState("");
    const [filterSecretID, setFilterSecretID] = useState("");
    const [filterBelenBaidalID, setFilterBelenBaidalID] = useState("");
    const [filterDivisionID, setFilterDivisionID] = useState("");
    const [filterHuygatsaa, setFilterHuygatsaa] = useState("");

    useEffect(() => {
        axios.get("/get/bichig/type").then((r) => setTypes(normalize(r))).catch(() => setTypes([]));
        axios.get("/get/bichig/angilal").then((r) => setSecrets(normalize(r))).catch(() => setSecrets([]));
        axios.get("/get/belen/baidal").then((r) => setBelenBaidal(normalize(r))).catch(() => setBelenBaidal([]));
        axios.get("/get/division").then((r) => setDivisions(normalize(r))).catch(() => setDivisions([]));
    }, []);

    const { sortedData, rowStatusList } = useMemo(() => {
        let list = getData.filter((row) => Number(row.catID) === 2);
        if (filterHariutaiEseh !== "") list = list.filter((r) => String(r.hariutaiEseh) === filterHariutaiEseh);
        if (filterTypeID !== "") list = list.filter((r) => String(r.typeID) === filterTypeID);
        if (filterSecretID !== "") list = list.filter((r) => String(r.secretID) === filterSecretID);
        if (filterBelenBaidalID !== "") list = list.filter((r) => String(r.belenBaidalID) === filterBelenBaidalID);
        if (filterDivisionID !== "") list = list.filter((r) => String(r.destinationTypeID) === filterDivisionID);
        let withStatus = list.map((row) => ({ ...row, _status: getRowStatus(row) }));
        if (filterHuygatsaa !== "") withStatus = withStatus.filter((r) => r._status === filterHuygatsaa);
        withStatus.sort((a, b) => sortOrder(a._status) - sortOrder(b._status));
        return {
            sortedData: withStatus,
            rowStatusList: withStatus.map((r) => r._status),
        };
    }, [getData, filterHariutaiEseh, filterTypeID, filterSecretID, filterBelenBaidalID, filterDivisionID, filterHuygatsaa]);

    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = () => {
        axios
            .get("/get/bichig", { params: { source: "irsen" } })
            .then((res) => {
                setRowsSelected([]);
                setData(res.data);
                setHariuData([]);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const selectedBichig = useMemo(() => {
        if (getRowsSelected[0] == null || !sortedData || !sortedData.length) return null;
        const idx = getRowsSelected[0];
        return sortedData[idx] ?? null;
    }, [getRowsSelected, sortedData]);

    const refreshHariu = () => {
        if (!selectedBichig?.id) return;
        axios
            .get("/get/bichig/hariu", { params: { bichigID: selectedBichig.id } })
            .then((res) => setHariuData(normalize(res)))
            .catch(() => setHariuData([]));
    };

    useEffect(() => {
        if (selectedBichig?.id) {
            refreshHariu();
        } else {
            setHariuData([]);
            setHariuRowsSelected([]);
        }
    }, [selectedBichig?.id]);

    useEffect(() => {
        if (hariuRowsSelected[0] != null && hariuData.length) {
            setIsHariuEditBtnClick(false);
            setClickedHariuRow(hariuData[hariuRowsSelected[0]] ?? null);
        }
    }, [hariuRowsSelected, hariuData]);

    const btnHariuEdit = () => setIsHariuEditBtnClick(true);

    const btnHariuDelete = () => {
        const row = hariuData[hariuRowsSelected[0]];
        if (!row?.id) return;
        Swal.fire({ title: "Хариу бичгийг устгах уу?", showCancelButton: true, confirmButtonText: "Тийм", cancelButtonText: "Үгүй" }).then((result) => {
            if (!result.isConfirmed) return;
            axios
                .post("/delete/bichig/hariu", { id: row.id })
                .then((res) => {
                    Swal.fire(res.data.msg);
                    setHariuRowsSelected([]);
                    refreshHariu();
                })
                .catch((err) => Swal.fire(err.response?.data?.msg || "Алдаа гарлаа."));
        });
    };

    return (
        <>
            <div className="row">
                <div className="info-box">
                    <div className="col-md-12">
                        <h1 className="text-center mb-4">Ирсэн баримт бичиг</h1>

                        <div className="card card-body mb-3">
                            <h6 className="mb-2">Хайлтын хэсэг</h6>
                            <div className="row mb-2">
                                <div className="col-md-4">
                                    <label className="small">Хариутай эсэх</label>
                                    <select className="form-control form-control-sm" value={filterHariutaiEseh} onChange={(e) => setFilterHariutaiEseh(e.target.value)}>
                                        <option value="">Бүгд</option>
                                        <option value="1">Хариугүй</option>
                                        <option value="2">Хариутай</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="small">Баримт бичгийн төрөл</label>
                                    <select className="form-control form-control-sm" value={filterTypeID} onChange={(e) => setFilterTypeID(e.target.value)}>
                                        <option value="">Бүгд</option>
                                        {types.map((t) => (
                                            <option key={t.id} value={t.id}>{t.typeName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="small">Баримт бичгийн нууцлал</label>
                                    <select className="form-control form-control-sm" value={filterSecretID} onChange={(e) => setFilterSecretID(e.target.value)}>
                                        <option value="">Бүгд</option>
                                        {secrets.map((s) => (
                                            <option key={s.id} value={s.id}>{s.secretName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4">
                                    <label className="small">Бэлэн байдлын зэрэг</label>
                                    <select className="form-control form-control-sm" value={filterBelenBaidalID} onChange={(e) => setFilterBelenBaidalID(e.target.value)}>
                                        <option value="">Бүгд</option>
                                        {belenBaidal.map((b) => (
                                            <option key={b.id} value={b.id}>{b.belenBaidalName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="small">Бүтцийн нэгж</label>
                                    <select className="form-control form-control-sm" value={filterDivisionID} onChange={(e) => setFilterDivisionID(e.target.value)}>
                                        <option value="">Бүгд</option>
                                        {divisions.map((d) => (
                                            <option key={d.id} value={d.id}>{d.nickName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="small">Хугацаа</label>
                                    <select className="form-control form-control-sm" value={filterHuygatsaa} onChange={(e) => setFilterHuygatsaa(e.target.value)}>
                                        <option value="">Бүгд</option>
                                        <option value={STATUS_OVERDUE}>Хугацаа дууссан</option>
                                        <option value={STATUS_WARNING}>Хугацаа дуусах ойртсон</option>
                                        <option value={STATUS_NORMAL}>Хэвийн</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <MUIDatatable
                            data={sortedData}
                            setdata={setData}
                            columns={getColumns((url, fileName) => { setPreviewPdfUrl(url); setPreviewFileName(fileName || ""); })}
                            setRowProps={(row, dataIndex, rowIndex) => {
                                const status = rowStatusList[rowIndex];
                                return {
                                    style: {
                                        backgroundColor:
                                            status === STATUS_OVERDUE
                                                ? "#ffcccc"
                                                : status === STATUS_WARNING
                                                ? "#fff3cd"
                                                : undefined,
                                    },
                                };
                            }}
                            costumToolbar={
                                <CustomToolbar
                                    btnClassName={"btn btn-success"}
                                    modelType={"modal"}
                                    dataTargetID={""}
                                    spanIconClassName={"fas fa-solid fa-plus"}
                                    buttonName={"Нэмэх"}
                                    excelDownloadData={sortedData}
                                    excelHeaders={excelHeaders}
                                    isHideInsert={false}
                                />
                            }
                            avgColumnIndex={-1}
                            avgColumnName={"email"}
                            avgName={"Дундаж: "}
                            getRowsSelected={getRowsSelected}
                            setRowsSelected={setRowsSelected}
                            isHideDelete={false}
                            isHideEdit={false}
                        />

                        {selectedBichig && (
                            <div className="card card-body mt-4">
                                <h5 className="mb-3">
                                    Хариу бичиг — {selectedBichig.dugaar} / {selectedBichig.aguulga?.slice?.(0, 50)}
                                    {selectedBichig.aguulga?.length > 50 ? "..." : ""}
                                </h5>
                                <MUIDatatable
                                    data={hariuData}
                                    setdata={setHariuData}
                                    columns={getHariuColumns((url, fileName) => {
                                        setPreviewPdfUrl(url);
                                        setPreviewFileName(fileName || "");
                                    })}
                                    costumToolbar={
                                        <CustomToolbar
                                            btnClassName={"btn btn-success"}
                                            modelType={"modal"}
                                            dataTargetID={"#HariuNew"}
                                            spanIconClassName={"fas fa-solid fa-plus"}
                                            buttonName={"Нэмэх"}
                                            excelDownloadData={hariuData}
                                            excelHeaders={hariuExcelHeaders}
                                            isHideInsert={true}
                                        />
                                    }
                                    btnEdit={btnHariuEdit}
                                    modelType={"modal"}
                                    editdataTargetID={"#HariuEdit"}
                                    btnDelete={btnHariuDelete}
                                    avgColumnIndex={-1}
                                    avgColumnName={"email"}
                                    avgName={"Дундаж: "}
                                    getRowsSelected={hariuRowsSelected}
                                    setRowsSelected={setHariuRowsSelected}
                                    isHideDelete={true}
                                    isHideEdit={true}
                                />
                                <HariuNew bichigID={selectedBichig?.id} refreshHariu={refreshHariu} />
                                <HariuEdit
                                    changeDataRow={clickedHariuRow}
                                    isEditBtnClick={isHariuEditBtnClick}
                                    refreshHariu={refreshHariu}
                                    setHariuRowsSelected={setHariuRowsSelected}
                                />
                            </div>
                        )}

                        {previewPdfUrl && (
                            <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
                                <div className="modal-dialog modal-xl">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title">{previewFileName}</h5>
                                            <button
                                                type="button"
                                                className="close"
                                                onClick={() => { setPreviewPdfUrl(null); setPreviewFileName(""); }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <div className="modal-body p-0">
                                            <iframe
                                                src={previewPdfUrl}
                                                title="PDF Preview"
                                                width="100%"
                                                height="600px"
                                                style={{ border: "none" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

const getColumns = (onPreviewPdf) => [
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
        name: "dugaar",
        label: "Дугаар",
        options: {
            filter: true,
            sort: true,
            setCellHeaderProps: () => ({
                style: { backgroundColor: "#5DADE2", color: "white" },
            }),
        },
    },
    {
        name: "aguulga",
        label: "Агуулга",
        options: {
            filter: true,
            sort: true,
            setCellHeaderProps: () => ({
                style: { backgroundColor: "#5DADE2", color: "white" },
            }),
        },
    },
    {
        name: "hariutaiEseh",
        label: "Хариутай эсэх",
        options: {
            filter: true,
            sort: true,
            customBodyRender: (value) =>
                value == 1 ? "Хариугүй" : value == 2 ? "Хариутай" : value ?? "",
            setCellHeaderProps: () => ({
                style: { backgroundColor: "#5DADE2", color: "white" },
            }),
        },
    },
    {
        name: "catName",
        label: "Баримт бичиг ангилал",
        options: {
            filter: true,
            sort: true,
            setCellHeaderProps: () => ({
                style: { backgroundColor: "#5DADE2", color: "white" },
            }),
        },
    },
    {
        name: "typeName",
        label: "Баримт бичгийн төрөл",
        options: {
            filter: true,
            sort: true,
            setCellHeaderProps: () => ({
                style: { backgroundColor: "#5DADE2", color: "white" },
            }),
        },
    },
    {
        name: "secretName",
        label: "Баримт бичгийн нууцлал",
        options: {
            filter: true,
            sort: true,
            setCellHeaderProps: () => ({
                style: { backgroundColor: "#5DADE2", color: "white" },
            }),
        },
    },
    {
        name: "level",
        label: "Үе шат",
        options: {
            filter: true,
            sort: true,
            setCellHeaderProps: () => ({
                style: { backgroundColor: "#5DADE2", color: "white" },
            }),
        },
    },
    {
        name: "belenBaidalName",
        label: "Бэлэн байдлын зэрэг",
        options: {
            filter: true,
            sort: true,
            setCellHeaderProps: () => ({
                style: { backgroundColor: "#5DADE2", color: "white" },
            }),
        },
    },
    {
        name: "sourceTypeName",
        label: "Хаанаас ирсэн",
        options: {
            filter: true,
            sort: true,
            setCellHeaderProps: () => ({
                style: { backgroundColor: "#5DADE2", color: "white" },
            }),
        },
    },
    // {
    //     name: "destinationTypeName",
    //     label: "Хаашаа явсан",
    //     options: {
    //         filter: true,
    //         sort: true,
    //         setCellHeaderProps: () => ({
    //             style: { backgroundColor: "#5DADE2", color: "white" },
    //         }),
    //     },
    // },

    {
        name: "pdf",
        label: "Хавсралт файл",
        options: {
            filter: false,
            sort: false,
            setCellHeaderProps: () => ({
                style: {
                    backgroundColor: "#5DADE2",
                    color: "white",
                },
            }),
            customBodyRender: (value) => {
                if (!value) return "-";
                const files = value.split(";").filter((f) => f.trim() !== "");
                const base = axios.defaults.baseURL || "";
                return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {files.map((path, index) => {
                            const fileName = path.split("/").pop();
                            const previewUrl = `${base}/download/ywsan-bichig?path=${encodeURIComponent(path)}`;
                            return (
                                <button
                                    key={index}
                                    type="button"
                                    title={fileName}
                                    className="btn btn-sm btn-outline-danger d-flex align-items-center"
                                    style={{ padding: "4px 8px", width: "fit-content", fontSize: "12px" }}
                                    onClick={() => onPreviewPdf(previewUrl, fileName)}
                                >
                                    <i className="fas fa-file-pdf mr-2"></i>
                                    {fileName}
                                </button>
                            );
                        })}
                    </div>
                );
            },
        },
    },
    {
        name: "fileSize",
        label: "Файлын хэмжээ",
        options: {
            filter: true,
            sort: true,
            customBodyRender: (value) => (value != null && value !== "" ? `${value} KB` : ""),
            setCellHeaderProps: () => ({
                style: { backgroundColor: "#5DADE2", color: "white" },
            }),
        },
    },
    {
        name: "ognoo",
        label: "Огноо",
        options: {
            filter: true,
            sort: true,
            setCellHeaderProps: () => ({
                style: { backgroundColor: "#5DADE2", color: "white" },
            }),
        },
    },
    {
        name: "hariuOgnoo",
        label: "Хугацаа",
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

const getHariuColumns = (onPreviewPdf) => [
    { name: "id", label: "№", options: { filter: false, sort: true, align: "center", customBodyRenderLite: (rowIndex) => rowIndex + 1, setCellProps: () => ({ align: "center" }), setCellHeaderProps: () => ({ style: { backgroundColor: "#28a745", color: "white", width: 50 } }) } },
    { name: "dugaar", label: "Дугаар", options: { filter: true, sort: true, setCellHeaderProps: () => ({ style: { backgroundColor: "#28a745", color: "white" } }) } },
    { name: "aguulga", label: "Агуулга", options: { filter: true, sort: true, setCellHeaderProps: () => ({ style: { backgroundColor: "#28a745", color: "white" } }) } },
    { name: "sourceTypeName", label: "Хаанаас", options: { filter: true, sort: true, setCellHeaderProps: () => ({ style: { backgroundColor: "#28a745", color: "white" } }) } },
    { name: "destinationTypeName", label: "Хаашаа", options: { filter: true, sort: true, setCellHeaderProps: () => ({ style: { backgroundColor: "#28a745", color: "white" } }) } },
    {
        name: "pdf",
        label: "Хавсралт",
        options: {
            filter: false,
            sort: false,
            setCellHeaderProps: () => ({ style: { backgroundColor: "#28a745", color: "white" } }),
            customBodyRender: (value) => {
                if (!value) return "-";
                const files = value.split(";").filter((f) => f.trim());
                const base = axios.defaults.baseURL || "";
                return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {files.map((path, i) => {
                            const fn = path.split("/").pop();
                            const url = `${base}/download/hariu-bichig?path=${encodeURIComponent(path)}`;
                            return (
                                <button key={i} type="button" className="btn btn-sm btn-outline-danger" style={{ padding: "4px 8px", width: "fit-content", fontSize: "12px" }} onClick={() => onPreviewPdf(url, fn)}>
                                    <i className="fas fa-file-pdf mr-2"></i>
                                    {fn}
                                </button>
                            );
                        })}
                    </div>
                );
            },
        },
    },
    { name: "fileSize", label: "Файлын хэмжээ (KB)", options: { filter: true, sort: true, customBodyRender: (v) => (v != null && v !== "" ? `${v} KB` : ""), setCellHeaderProps: () => ({ style: { backgroundColor: "#28a745", color: "white" } }) } },
    { name: "ognoo", label: "Огноо", options: { filter: true, sort: true, setCellHeaderProps: () => ({ style: { backgroundColor: "#28a745", color: "white" } }) } },
    { name: "description", label: "Тайлбар", options: { filter: true, sort: false, setCellHeaderProps: () => ({ style: { backgroundColor: "#28a745", color: "white" } }) } },
    { name: "created_at", label: "Үүсгэсэн", options: { filter: true, sort: true, setCellHeaderProps: () => ({ style: { backgroundColor: "#28a745", color: "white" } }) } },
    { name: "updated_at", label: "Шинэчлэгдсэн", options: { filter: true, sort: true, setCellHeaderProps: () => ({ style: { backgroundColor: "#28a745", color: "white" } }) } },
];

const hariuExcelHeaders = [
    { label: "Дугаар", key: "dugaar" },
    { label: "Агуулга", key: "aguulga" },
    { label: "Хаанаас", key: "sourceTypeName" },
    { label: "Хаашаа", key: "destinationTypeName" },
    { label: "PDF", key: "pdf" },
    { label: "Файлын хэмжээ", key: "fileSize" },
    { label: "Огноо", key: "ognoo" },
    { label: "Тайлбар", key: "description" },
    { label: "Үүсгэсэн", key: "created_at" },
    { label: "Шинэчлэгдсэн", key: "updated_at" },
];

const excelHeaders = [
    { label: "Дугаар", key: "dugaar" },
    { label: "Агуулга", key: "aguulga" },
    { label: "Хариутай эсэх", key: "hariutaiEseh" },
    { label: "Баримт бичгийн ангилал", key: "catName" },
    { label: "Баримт бичгийн төрөл", key: "typeName" },
    { label: "Баримт бичгийн нууцлал", key: "secretName" },
    { label: "Үе шат", key: "level" },
    { label: "Бэлэн байдлын зэрэг", key: "belenBaidalName" },
    { label: "Хаанаас ирсэн", key: "sourceTypeName" },
    { label: "Хаашаа явсан", key: "destinationTypeName" },
    { label: "PDF файл", key: "pdf" },
    { label: "Файлын хэмжээ", key: "fileSize" },
    { label: "Огноо", key: "ognoo" },
    { label: "Хугацаа", key: "hariuOgnoo" },
    { label: "Тайлбар", key: "description" },
];

export default IrsenBichigIndex;
