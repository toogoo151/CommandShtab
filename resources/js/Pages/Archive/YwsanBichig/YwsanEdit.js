import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import axios from "../../../AxiosUser";

const normalize = (res) => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);

const formatFileSize = (bytes) => {
    if (bytes == null || bytes === 0) return "";
    if (typeof bytes === "string") return bytes;
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const filesizes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const getDownloadUrl = (path) => {
    const base = axios.defaults.baseURL || "";
    return `${base}/download/ywsan-bichig?path=${encodeURIComponent(path)}`;
};

const YwsanEdit = ({ changeDataRow, refreshData, setRowsSelected }) => {
    const [types, setTypes] = useState([]);
    const [secrets, setSecrets] = useState([]);
    const [belenBaidal, setBelenBaidal] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [pdfKeepPaths, setPdfKeepPaths] = useState([]);
    const [selectedfile, setSelectedFile] = useState([]);
    const fileInputRef = useRef(null);

    const [hariutaiEseh, setHariutaiEseh] = useState("1");
    const [typeID, setTypeID] = useState("");
    const [secretID, setSecretID] = useState("");
    const [level, setLevel] = useState("");
    const [belenBaidalID, setBelenBaidalID] = useState("");
    const [sourceTypeID, setSourceTypeID] = useState("");
    const [destinationTypeIDs, setDestinationTypeIDs] = useState([]);
    const [groupIds, setGroupIds] = useState([]);
    const [dugaar, setDugaar] = useState("");
    const [aguulga, setAguulga] = useState("");
    const [ognoo, setOgnoo] = useState("");
    const [hariuOgnoo, setHariuOgnoo] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        axios.get("/get/bichig/type").then((r) => setTypes(normalize(r))).catch(() => setTypes([]));
        axios.get("/get/bichig/angilal").then((r) => setSecrets(normalize(r))).catch(() => setSecrets([]));
        axios.get("/get/belen/baidal").then((r) => setBelenBaidal(normalize(r))).catch(() => setBelenBaidal([]));
        axios.get("/get/division").then((r) => setDivisions(normalize(r))).catch(() => setDivisions([]));
    }, []);

    useEffect(() => {
        if (!changeDataRow?.id) return;
        axios
            .get("/get/bichig/group", { params: { id: changeDataRow.id } })
            .then((res) => {
                const group = normalize(res);
                const first = group.length > 0 ? group[0] : changeDataRow;
                if (group.length === 0) {
                    setGroupIds([changeDataRow.id]);
                    setDestinationTypeIDs(changeDataRow.destinationTypeID != null ? [String(changeDataRow.destinationTypeID)] : []);
                } else {
                    setGroupIds(group.map((r) => r.id));
                    setDestinationTypeIDs(group.map((r) => String(r.destinationTypeID ?? "")).filter(Boolean));
                }
                setHariutaiEseh(String(first.hariutaiEseh ?? "1"));
                setTypeID(String(first.typeID ?? ""));
                setSecretID(String(first.secretID ?? ""));
                setLevel(first.level ?? "");
                setBelenBaidalID(String(first.belenBaidalID ?? ""));
                setSourceTypeID(String(first.sourceTypeID ?? ""));
                setDugaar(first.dugaar ?? "");
                setAguulga(first.aguulga ?? "");
                const paths = (first.pdf || "").split(";").map((p) => p.trim()).filter(Boolean);
                setPdfKeepPaths(paths);
                setSelectedFile([]);
                setOgnoo(first.ognoo ? String(first.ognoo).replace(" ", "T").slice(0, 16) : "");
                setHariuOgnoo(first.hariuOgnoo ?? "");
                setDescription(first.description ?? "");
                if (fileInputRef.current) fileInputRef.current.value = null;
            })
            .catch(() => {});
    }, [changeDataRow?.id]);

    const toggleDestination = (id) => {
        const sid = String(id);
        setDestinationTypeIDs((prev) => {
            const next = prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid];
            return next;
        });
    };

    const removeKeepPath = (path) => {
        setPdfKeepPaths((prev) => prev.filter((p) => p !== path));
    };

    const convertToBase64 = (e) => {
        for (let i = 0; i < e.target.files.length; i++) {
            const file = e.target.files[i];
            const fileNameExists = selectedfile.some((existingFile) => existingFile.filename === file.name);
            if (fileNameExists) {
                Swal.fire({ icon: "warning", text: `"${file.name}" аль хэдийн сонгосон байна.` });
                e.target.value = null;
                return;
            }
            setSelectedFile((preValue) => [
                ...preValue,
                {
                    id: nanoid(),
                    filename: file.name,
                    filesize: filesizes(file.size),
                    file,
                },
            ]);
        }
        e.target.value = null;
    };

    const DeleteSelectFile = (id) => {
        setSelectedFile((prev) => prev.filter((data) => data.id !== id));
    };

    const saveEdit = () => {
        if (!dugaar?.trim()) return Swal.fire("Дугаар оруулна уу.");
        if (!aguulga?.trim()) return Swal.fire("Агуулга оруулна уу.");
        if (!ognoo) return Swal.fire("Огноо оруулна уу.");
        if (destinationTypeIDs.length < 2) return Swal.fire("Хаашаа явсан хэсэгт дор хаяж 2 бүтцийн нэгж сонгоно уу.");
        if (hariutaiEseh === "2" && (hariuOgnoo === "" || hariuOgnoo == null)) {
            return Swal.fire("Хариу өгөх хугацаа оруулна уу.");
        }

        const formData = new FormData();
        formData.append("source", "ywsan");
        groupIds.forEach((id) => formData.append("ids[]", id));
        formData.append("hariutaiEseh", hariutaiEseh);
        formData.append("typeID", typeID);
        formData.append("secretID", secretID);
        formData.append("sourceTypeID", sourceTypeID);
        destinationTypeIDs.forEach((id) => formData.append("destinationTypeID[]", id));
        formData.append("dugaar", dugaar.trim());
        formData.append("aguulga", aguulga.trim());
        formData.append("ognoo", ognoo);
        formData.append("pdf_keep", pdfKeepPaths.join(";"));
        if (level) formData.append("level", level);
        if (belenBaidalID) formData.append("belenBaidalID", belenBaidalID);
        if (description) formData.append("description", description);
        if (hariutaiEseh === "2" && hariuOgnoo != null && hariuOgnoo !== "") {
            formData.append("hariuOgnoo", Number(hariuOgnoo));
        }
        selectedfile.forEach((item) => {
            if (item.file) formData.append("pdf[]", item.file);
        });

        axios
            .post("/edit/bichig", formData)
            .then((res) => {
                Swal.fire(res.data?.msg || "Амжилттай заслаа.");
                if (window.$) window.$("#YwsanEdit").modal("hide");
                if (typeof setRowsSelected === "function") setRowsSelected([]);
                if (typeof refreshData === "function") refreshData();
            })
            .catch((err) => Swal.fire(err.response?.data?.msg || "Алдаа гарлаа."));
    };

    return (
        <div className="modal" id="YwsanEdit">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">Явсан баримт бичиг засах</h4>
                        <button type="button" className="close" data-dismiss="modal">
                            ×
                        </button>
                    </div>
                    <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                    <div className="row">
                            <div className="col-md-6">
                                <label>Дугаар</label>
                                <input type="text" className="form-control mb-2" value={dugaar} onChange={(e) => setDugaar(e.target.value)} placeholder="Дугаар" />
                            </div>
                            <div className="col-md-6">
                                <label>Огноо</label>
                                <input type="datetime-local" className="form-control mb-2" value={ognoo} onChange={(e) => setOgnoo(e.target.value)} />
                            </div>

                        </div>

                        <div className="row">
                            <div className="col-12">
                                <label>Агуулга</label>
                                <textarea className="form-control mb-2" rows={2} value={aguulga} onChange={(e) => setAguulga(e.target.value)} placeholder="Агуулга" />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <label>Хариутай эсэх</label>
                                <select className="form-control mb-2" value={hariutaiEseh} onChange={(e) => setHariutaiEseh(e.target.value)}>
                                    <option value="1">Хариугүй</option>
                                    <option value="2">Хариутай</option>
                                </select>
                            </div>
                            {hariutaiEseh === "2" && (
                                <div className="col-md-6">
                                    <label>Хариу өгөх хугацаа (минут)</label>
                                    <input type="number" className="form-control mb-2" value={hariuOgnoo} onChange={(e) => setHariuOgnoo(e.target.value)} placeholder="Минут" min={0} />
                                </div>
                            )}
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <label>Баримт бичгийн төрөл</label>
                                <select className="form-control mb-2" value={typeID} onChange={(e) => setTypeID(e.target.value)}>
                                    <option value="">Сонгоно уу</option>
                                    {types.map((t) => (
                                        <option key={t.id} value={t.id}>{t.typeName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label>Нууцлал</label>
                                <select className="form-control mb-2" value={secretID} onChange={(e) => setSecretID(e.target.value)}>
                                    <option value="">Сонгоно уу</option>
                                    {secrets.map((s) => (
                                        <option key={s.id} value={s.id}>{s.secretName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="row">

                            <div className="col-md-6">
                                <label>Үе шат</label>
                                <input type="text" className="form-control mb-2" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="Үе шат" />
                            </div>
                            <div className="col-md-6">
                                <label>Бэлэн байдлын зэрэг</label>
                                <select className="form-control mb-2" value={belenBaidalID} onChange={(e) => setBelenBaidalID(e.target.value)}>
                                    <option value="">Сонгоно уу</option>
                                    {belenBaidal.map((b) => (
                                        <option key={b.id} value={b.id}>{b.belenBaidalName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="row">

                            <div className="col-md-12">
                                <label>Хаашаа явсан (дор хаяж 2 бүтцийн нэгж сонгоно)</label>
                                <div className="border rounded p-2 mb-2" style={{ maxHeight: "160px", overflowY: "auto" }}>
                                    {divisions.map((d) => (
                                        <div key={d.id} className="custom-control custom-checkbox">
                                            <input
                                                type="checkbox"
                                                className="custom-control-input"
                                                id={`dest-edit-${d.id}`}
                                                checked={destinationTypeIDs.includes(String(d.id))}
                                                onChange={() => toggleDestination(d.id)}
                                            />
                                            <label className="custom-control-label" htmlFor={`dest-edit-${d.id}`}>
                                                {d.nickName}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>



                        <div className="row">
                            <div className="col-md-12">
                                <label className="btn btn-outline-primary w-100 mb-2">
                                    <i className="fas fa-upload mr-2"></i>
                                    PDF хавсралт файл нэмэх
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        multiple
                                        hidden
                                        onChange={convertToBase64}
                                        ref={fileInputRef}
                                    />
                                </label>

                                {pdfKeepPaths.length > 0 && (
                                    <>

                                        {pdfKeepPaths.map((path) => (
                                            <div key={path} className="border rounded p-2 mb-2 d-flex align-items-center justify-content-between">
                                                <a href={getDownloadUrl(path)} target="_blank" rel="noopener noreferrer" className="text-primary">
                                                    <i className="far fa-file-pdf text-danger mr-2"></i>
                                                    {path.split("/").pop()}
                                                </a>
                                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeKeepPath(path)}>
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {selectedfile.length > 0 && <small className="text-muted d-block mb-2 mt-2">Шинэ нэмэгдэх файлууд:</small>}
                                {selectedfile.map((file) => (
                                    <div key={file.id} className="border rounded p-2 mb-2 d-flex align-items-center justify-content-between">
                                        <span><i className="far fa-file-pdf text-danger mr-2"></i>{file.filename} ({file.filesize})</span>
                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => DeleteSelectFile(file.id)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>



                        <div className="row">
                            <div className="col-12">
                                <label>Тайлбар</label>
                                <textarea className="form-control mb-2" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Тайлбар" />
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-success" onClick={saveEdit}>
                            Засах
                        </button>
                        <button type="button" className="btn btn-danger" data-dismiss="modal">
                            Хаах
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YwsanEdit;
