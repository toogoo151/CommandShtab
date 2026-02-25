import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import * as Yup from "yup";
import axios from "../../../AxiosUser";
import { yupResolver } from "@hookform/resolvers/yup";

const normalize = (res) => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);

const filesizes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const HariuEdit = ({ changeDataRow, isEditBtnClick, refreshHariu, setHariuRowsSelected }) => {
    const [divisions, setDivisions] = useState([]);
    const [destinationTypeIDs, setDestinationTypeIDs] = useState([]);
    const [groupIds, setGroupIds] = useState([]);
    const [selectedfile, setSelectedFile] = useState([]);
    const [keepPdfPaths, setKeepPdfPaths] = useState([]);
    const fileInputRef = useRef(null);

    const formSchema = Yup.object().shape({
        destinationTypeID: Yup.array().of(Yup.string().required()).min(2, "Хаашаа явсан дор хаяж 2 бүтцийн нэгж сонгоно уу."),
        dugaar: Yup.string().required("Дугаар оруулна уу."),
        aguulga: Yup.string().required("Агуулга оруулна уу."),
        ognoo: Yup.string().required("Огноо оруулна уу."),
    });

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        mode: "onSubmit",
        resolver: yupResolver(formSchema),
        defaultValues: { destinationTypeID: [], dugaar: "", aguulga: "", ognoo: "", description: "" },
    });

    const toggleDestination = (id) => {
        const sid = String(id);
        setDestinationTypeIDs((prev) => (prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]));
    };

    useEffect(() => {
        setValue("destinationTypeID", destinationTypeIDs);
    }, [destinationTypeIDs, setValue]);

    useEffect(() => {
        axios.get("/get/division").then((r) => setDivisions(normalize(r))).catch(() => setDivisions([]));
    }, []);

    useEffect(() => {
        if (!isEditBtnClick || !changeDataRow?.id) return;
        axios
            .get("/get/bichig/hariu/group", { params: { id: changeDataRow.id } })
            .then((res) => {
                const group = normalize(res);
                const first = group.length > 0 ? group[0] : changeDataRow;
                setGroupIds(group.length > 0 ? group.map((r) => r.id) : [changeDataRow.id]);
                setDestinationTypeIDs(
                    group.length > 0 ? group.map((r) => String(r.destinationTypeID ?? "")).filter(Boolean) : changeDataRow.destinationTypeID != null ? [String(changeDataRow.destinationTypeID)] : []
                );
                setValue("dugaar", first.dugaar ?? "");
                setValue("aguulga", first.aguulga ?? "");
                const o = first.ognoo;
                setValue("ognoo", o ? (typeof o === "string" ? o.slice(0, 10) : new Date(o).toISOString().slice(0, 10)) : "");
                setValue("description", first.description ?? "");
                const pdf = first.pdf;
                setKeepPdfPaths(pdf ? pdf.split(";").filter((f) => f.trim()) : []);
                setSelectedFile([]);
            })
            .catch(() => {
                setGroupIds([changeDataRow.id]);
                setDestinationTypeIDs(changeDataRow.destinationTypeID != null ? [String(changeDataRow.destinationTypeID)] : []);
                setValue("dugaar", changeDataRow.dugaar ?? "");
                setValue("aguulga", changeDataRow.aguulga ?? "");
                const o = changeDataRow.ognoo;
                setValue("ognoo", o ? (typeof o === "string" ? o.slice(0, 10) : new Date(o).toISOString().slice(0, 10)) : "");
                setValue("description", changeDataRow.description ?? "");
                setKeepPdfPaths(changeDataRow.pdf ? changeDataRow.pdf.split(";").filter((f) => f.trim()) : []);
                setSelectedFile([]);
            });
    }, [isEditBtnClick, changeDataRow?.id, setValue]);

    const convertToBase64 = (e) => {
        for (let i = 0; i < e.target.files.length; i++) {
            const file = e.target.files[i];
            setSelectedFile((prev) => [...prev, { id: nanoid(), filename: file.name, filesize: filesizes(file.size), file }]);
        }
        e.target.value = null;
    };

    const DeleteSelectFile = (id) => {
        setSelectedFile((prev) => prev.filter((d) => d.id !== id));
    };

    const removeKeepPath = (path) => {
        setKeepPdfPaths((prev) => prev.filter((p) => p !== path));
    };

    const onSubmit = (data) => {
        const destIds = destinationTypeIDs.length ? destinationTypeIDs : (Array.isArray(data.destinationTypeID) ? data.destinationTypeID : []);
        if (destIds.length < 2) return Swal.fire("Хаашаа явсан хэсэгт дор хаяж 2 бүтцийн нэгж сонгоно уу.");
        const formData = new FormData();
        groupIds.forEach((id) => formData.append("ids[]", id));
        destIds.forEach((id) => formData.append("destinationTypeID[]", id));
        formData.append("dugaar", data.dugaar);
        formData.append("aguulga", data.aguulga);
        formData.append("ognoo", data.ognoo);
        formData.append("pdf_keep", keepPdfPaths.join(";"));
        if (data.description) formData.append("description", data.description);
        selectedfile.forEach((item) => {
            if (item.file) formData.append("pdf[]", item.file);
        });

        axios
            .post("/edit/bichig/hariu", formData)
            .then((res) => {
                Swal.fire(res.data.msg);
                reset();
                setSelectedFile([]);
                setKeepPdfPaths([]);
                if (fileInputRef.current) fileInputRef.current.value = null;
                refreshHariu();
                setHariuRowsSelected?.([]);
                if (window.$) window.$("#HariuEdit").modal("hide");
            })
            .catch((err) => Swal.fire(err.response?.data?.msg || "Алдаа гарлаа."));
    };

    if (!changeDataRow) return null;

    return (
        <div className="modal" id="HariuEdit">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">Хариу бичиг засах</h4>
                        <button type="button" className="close" data-dismiss="modal">×</button>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit, (err) => Swal.fire({ icon: "warning", text: Object.values(err)[0]?.message || "Заавал бөглөнө үү" }))}>
                        <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                            <div className="row">
                                <div className="col-md-6">
                                    <label>Дугаар</label>
                                    <input type="text" className="form-control mb-2" {...register("dugaar")} placeholder="Дугаар" />
                                    <p className="alerts">{errors.dugaar?.message}</p>
                                </div>
                                <div className="col-md-6">
                                    <label>Огноо</label>
                                    <input type="date" className="form-control mb-2" {...register("ognoo")} />
                                    <p className="alerts">{errors.ognoo?.message}</p>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    <label>Агуулга</label>
                                    <textarea className="form-control mb-2" rows={3} {...register("aguulga")} placeholder="Агуулга" />
                                    <p className="alerts">{errors.aguulga?.message}</p>
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
                                                    id={`hariu-dest-edit-${d.id}`}
                                                    checked={destinationTypeIDs.includes(String(d.id))}
                                                    onChange={() => toggleDestination(d.id)}
                                                />
                                                <label className="custom-control-label" htmlFor={`hariu-dest-edit-${d.id}`}>
                                                    {d.nickName}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="alerts">{errors.destinationTypeID?.message}</p>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    <label className="btn btn-outline-primary w-100 mb-2">
                                        <i className="fas fa-upload mr-2"></i>
                                        PDF хавсралт файл нэмэх
                                        <input type="file" accept=".pdf,.doc,.docx" multiple hidden onChange={convertToBase64} ref={fileInputRef} />
                                    </label>
                                    {keepPdfPaths.length > 0 && (
                                        <div className="mb-2">
                                            <small className="text-muted">Одоо байгаа файлууд:</small>
                                            {keepPdfPaths.map((path) => (
                                                <div key={path} className="border rounded p-2 mb-1 d-flex align-items-center justify-content-between">
                                                    <span>{path.split("/").pop()}</span>
                                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeKeepPath(path)}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {selectedfile.map((file) => (
                                        <div key={file.id} className="border rounded p-2 mb-2 d-flex align-items-center justify-content-between">
                                            <span>{file.filename} ({file.filesize})</span>
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
                                    <textarea className="form-control mb-2" rows={2} {...register("description")} placeholder="Тайлбар" />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="submit" className="btn btn-success">Засах</button>
                            <button type="button" className="btn btn-danger" data-dismiss="modal">Хаах</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HariuEdit;
