import { yupResolver } from "@hookform/resolvers/yup";
import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import * as Yup from "yup";
import axios from "../../../AxiosUser";

const normalize = (res) => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);

const filesizes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const YwsanNew = ({ refreshData }) => {
    const [types, setTypes] = useState([]);
    const [secrets, setSecrets] = useState([]);
    const [belenBaidal, setBelenBaidal] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [adminDivisionID, setAdminDivisionID] = useState(null);
    const [destinationTypeIDs, setDestinationTypeIDs] = useState([]);
    const [selectedfile, setSelectedFile] = useState([]);
    const [previewFile, setPreviewFile] = useState(null);
    const fileInputRef = useRef(null);

    const formSchema = Yup.object().shape({
        hariutaiEseh: Yup.string().required("Хариутай эсэх сонгоно уу."),
        typeID: Yup.string().required("Баримт бичгийн төрөл сонгоно уу."),
        secretID: Yup.string().required("Нууцлал сонгоно уу."),
        sourceTypeID: Yup.string().required("Хаанаас ирсэн (админы нэгж) тохируулагдаагүй байна."),
        destinationTypeID: Yup.array()
            .of(Yup.string().required())
            .min(1, "Хаашаа явсан дор хаяж 1 бүтцийн нэгж сонгоно уу."),
        dugaar: Yup.string().required("Дугаар оруулна уу."),
        aguulga: Yup.string().required("Агуулга оруулна уу."),
        ognoo: Yup.string().required("Огноо оруулна уу."),
        hariuOgnoo: Yup.mixed().when("hariutaiEseh", {
            is: "2",
            then: (s) =>
                Yup.number()
                    .required("Хариу өгөх хугацаа оруулна уу.")
                    .transform((v) => (v === "" || v == null ? undefined : Number(v))),
            otherwise: (s) => Yup.string().nullable().transform(() => null),
        }),
    });

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
        reset,
    } = useForm({
        mode: "onSubmit",
        resolver: yupResolver(formSchema),
        defaultValues: {
            hariutaiEseh: "1",
            level: "",
            hariuOgnoo: null,
            sourceTypeID: "",
            destinationTypeID: [],
        },
    });

    useEffect(() => {
        if (adminDivisionID != null) setValue("sourceTypeID", adminDivisionID);
    }, [adminDivisionID, setValue]);

    useEffect(() => {
        setValue("destinationTypeID", destinationTypeIDs);
    }, [destinationTypeIDs, setValue]);

    const hariutaiEseh = watch("hariutaiEseh");

    const toggleDestination = (id) => {
        const sid = String(id);
        setDestinationTypeIDs((prev) => {
            const next = prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid];
            return next;
        });
    };

    useEffect(() => {
        axios.get("/get/bichig/type").then((r) => setTypes(normalize(r))).catch(() => setTypes([]));
        axios.get("/get/bichig/angilal").then((r) => setSecrets(normalize(r))).catch(() => setSecrets([]));
        axios.get("/get/belen/baidal").then((r) => setBelenBaidal(normalize(r))).catch(() => setBelenBaidal([]));
        axios.get("/get/division").then((r) => setDivisions(normalize(r))).catch(() => setDivisions([]));
        axios.get("/get/auth/current").then((r) => {
            const d = r?.data;
            if (d?.divisionID != null) setAdminDivisionID(String(d.divisionID));
        }).catch(() => {});
    }, []);

    const convertToBase64 = (e) => {
        for (let i = 0; i < e.target.files.length; i++) {
            const file = e.target.files[i];
            const fileNameExists = selectedfile.some((existingFile) => existingFile.filename === file.name);
            if (fileNameExists) {
                Swal.fire({ icon: "warning", text: `"${file.name}" аль хэдийн сонгосон байна.` });
                e.target.value = null;
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedFile((preValue) => [
                    ...preValue,
                    {
                        id: nanoid(),
                        filename: file.name,
                        filetype: file.type,
                        fileimage: reader.result,
                        datetime: file.lastModified ? new Date(file.lastModified).toLocaleString("en-IN") : "",
                        filesize: filesizes(file.size),
                        file,
                    },
                ]);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = null;
    };

    const DeleteSelectFile = (id) => {
        if (window.confirm("Энэ файлыг хасах гэж байна уу?")) {
            setSelectedFile((prev) => prev.filter((data) => data.id !== id));
            setPreviewFile((prev) => (prev && prev.id === id ? null : prev));
        }
    };

    const onSubmit = (data) => {
        const sourceTypeID = data.sourceTypeID || adminDivisionID || "";
        const destIds = destinationTypeIDs.length ? destinationTypeIDs : (Array.isArray(data.destinationTypeID) ? data.destinationTypeID : []);
        const formData = new FormData();
        formData.append("source", "ywsan");
        formData.append("hariutaiEseh", data.hariutaiEseh);
        formData.append("typeID", data.typeID);
        formData.append("secretID", data.secretID);
        formData.append("sourceTypeID", sourceTypeID);
        destIds.forEach((id) => formData.append("destinationTypeID[]", id));
        formData.append("dugaar", data.dugaar);
        formData.append("aguulga", data.aguulga);
        formData.append("ognoo", data.ognoo);
        if (data.level) formData.append("level", data.level);
        if (data.belenBaidalID) formData.append("belenBaidalID", data.belenBaidalID);
        if (data.description) formData.append("description", data.description);
        if (data.hariutaiEseh === "2" && data.hariuOgnoo != null && data.hariuOgnoo !== "") {
            formData.append("hariuOgnoo", Number(data.hariuOgnoo));
        }
        selectedfile.forEach((item) => {
            if (item.file) formData.append("pdf[]", item.file);
        });

        axios
            .post("/new/bichig", formData)
            .then((res) => {
                Swal.fire(res.data.msg);
                setSelectedFile([]);
                setPreviewFile(null);
                if (fileInputRef.current) fileInputRef.current.value = null;
                setDestinationTypeIDs([]);
                reset({
                    hariutaiEseh: "1",
                    typeID: "",
                    secretID: "",
                    level: "",
                    belenBaidalID: "",
                    sourceTypeID: adminDivisionID || "",
                    destinationTypeID: [],
                    dugaar: "",
                    aguulga: "",
                    ognoo: "",
                    hariuOgnoo: null,
                    description: "",
                });
                refreshData();
                if (window.$) window.$("#YwsanNew").modal("hide");
            })
            .catch((err) => Swal.fire(err.response?.data?.msg || "Алдаа гарлаа."));
    };

    return (
        <div className="modal" id="YwsanNew">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">Явсан баримт бичиг нэмэх</h4>
                        <button type="button" className="close" data-dismiss="modal">
                            ×
                        </button>
                    </div>
                    <form
                        onSubmit={handleSubmit(onSubmit, (err) => {
                            const firstError = Object.values(err)[0]?.message;
                            Swal.fire({ icon: "warning", title: "Заавал бөглөнө үү", text: firstError || "Заавал бөглөх талбаруудыг шалгана уу." });
                        })}
                    >
                        <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                        <div className="row">
                                <div className="col-md-6">
                                    <label>Дугаар</label>
                                    <input type="text" className="form-control mb-2" {...register("dugaar")} placeholder="Дугаар" />
                                    <p className="alerts">{errors.dugaar?.message}</p>
                                </div>
                                <div className="col-md-6" style={{ display: "none" }}>
                                    <input type="hidden" {...register("sourceTypeID")} />
                                </div>
                                <div className="col-md-6">
                                    <label>Огноо</label>
                                    <input type="datetime-local" className="form-control mb-2" {...register("ognoo")} />
                                    <p className="alerts">{errors.ognoo?.message}</p>

                            </div>
                            </div>

                            <div className="row">
                                <div className="col-12">
                                    <label>Агуулга</label>
                                    <textarea className="form-control mb-2" rows={2} {...register("aguulga")} placeholder="Агуулга" />
                                    <p className="alerts">{errors.aguulga?.message}</p>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <label>Хариутай эсэх</label>
                                    <select className="form-control mb-2" {...register("hariutaiEseh")}>
                                        <option value="1">Хариугүй</option>
                                        <option value="2">Хариутай</option>
                                    </select>
                                </div>
                                {hariutaiEseh === "2" && (
                                    <div className="col-md-6">
                                        <label>Хариу өгөх хугацаа (минут)</label>
                                        <input type="number" className="form-control mb-2" {...register("hariuOgnoo")} placeholder="Минут" min={0} />
                                        <p className="alerts">{errors.hariuOgnoo?.message}</p>
                                    </div>
                                )}
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <label>Баримт бичгийн төрөл</label>
                                    <select className="form-control mb-2" {...register("typeID")}>
                                        <option value="">Сонгоно уу</option>
                                        {types.map((t) => (
                                            <option key={t.id} value={String(t.id)}>{t.typeName}</option>
                                        ))}
                                    </select>
                                    <p className="alerts">{errors.typeID?.message}</p>
                                </div>
                                <div className="col-md-6">
                                    <label>Нууцлал</label>
                                    <select className="form-control mb-2" {...register("secretID")}>
                                        <option value="">Сонгоно уу</option>
                                        {secrets.map((s) => (
                                            <option key={s.id} value={String(s.id)}>{s.secretName}</option>
                                        ))}
                                    </select>
                                    <p className="alerts">{errors.secretID?.message}</p>
                                </div>
                            </div>

                            <div className="row">

                                <div className="col-md-6">
                                    <label>Үе шат</label>
                                    <input type="text" className="form-control mb-2" {...register("level")} placeholder="Үе шат" />
                                </div>
                                <div className="col-md-6">
                                    <label>Бэлэн байдлын зэрэг</label>
                                    <select className="form-control mb-2" {...register("belenBaidalID")}>
                                        <option value="">Сонгоно уу</option>
                                        {belenBaidal.map((b) => (
                                            <option key={b.id} value={String(b.id)}>{b.belenBaidalName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-12">
                                    <label>Хаашаа явсан (дор хаяж 1 бүтцийн нэгж сонгоно)</label>
                                    <div className="border rounded p-2 mb-2" style={{ maxHeight: "160px", overflowY: "auto" }}>
                                        {divisions.map((d) => (
                                            <div key={d.id} className="custom-control custom-checkbox">
                                                <input
                                                    type="checkbox"
                                                    className="custom-control-input"
                                                    id={`dest-new-${d.id}`}
                                                    checked={destinationTypeIDs.includes(String(d.id))}
                                                    onChange={() => toggleDestination(d.id)}
                                                />
                                                <label className="custom-control-label" htmlFor={`dest-new-${d.id}`}>
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
                                        PDF хавсралт файл сонгох
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            multiple
                                            hidden
                                            onChange={convertToBase64}
                                            ref={fileInputRef}
                                        />
                                    </label>

                                    {selectedfile.length === 0 && (
                                        <div className="text-muted text-center py-3 border rounded">
                                            Хавсралт файл сонгогдоогүй байна
                                        </div>
                                    )}

                                    {selectedfile.map((file) => (
                                        <div key={file.id} className="border rounded p-2 mb-2">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center">
                                                    <i
                                                        className={`far ${
                                                            file.filename.match(/\.pdf$/i)
                                                                ? "fa-file-pdf text-danger"
                                                                : "fa-file-alt text-primary"
                                                        } fa-2x mr-3`}
                                                    ></i>
                                                    <div>
                                                        <div className="font-weight-bold">{file.filename}</div>
                                                        <small className="text-muted">
                                                            {file.filesize} · {file.datetime}
                                                        </small>
                                                    </div>
                                                </div>
                                                <div>
                                                    {file.filename.match(/\.pdf$/i) && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-info mr-2"
                                                            onClick={() => setPreviewFile(file)}
                                                        >
                                                            <i className="fas fa-eye"></i> Урьдчилан харах
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => DeleteSelectFile(file.id)}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {previewFile && (
                                <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
                                    <div className="modal-dialog modal-xl">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">{previewFile.filename}</h5>
                                                <button type="button" className="close" onClick={() => setPreviewFile(null)}>
                                                    ×
                                                </button>
                                            </div>
                                            <div className="modal-body p-0">
                                                <iframe
                                                    src={previewFile.fileimage}
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



                            <div className="row">
                                <div className="col-12">
                                    <label>Тайлбар</label>
                                    <textarea className="form-control mb-2" rows={2} {...register("description")} placeholder="Тайлбар" />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="submit" className="btn btn-success">
                                Нэмэх
                            </button>
                            <button type="button" className="btn btn-danger" data-dismiss="modal">
                                Хаах
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default YwsanNew;
