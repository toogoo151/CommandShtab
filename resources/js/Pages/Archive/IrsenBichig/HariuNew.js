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
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const HariuNew = ({ bichigID, refreshHariu, onClose }) => {
    const [divisions, setDivisions] = useState([]);
    const [destinationTypeIDs, setDestinationTypeIDs] = useState([]);
    const [selectedfile, setSelectedFile] = useState([]);
    const [previewFile, setPreviewFile] = useState(null);
    const fileInputRef = useRef(null);

    const formSchema = Yup.object().shape({
        destinationTypeID: Yup.array().of(Yup.string().required()).min(1, "Хаашаа явсан дор хаяж 1 бүтцийн нэгж сонгоно уу."),
        dugaar: Yup.string().required("Дугаар оруулна уу."),
        aguulga: Yup.string().required("Агуулга оруулна уу."),
        ognoo: Yup.string().required("Огноо оруулна уу."),
    });

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        mode: "onSubmit",
        resolver: yupResolver(formSchema),
        defaultValues: { destinationTypeID: [], dugaar: "", aguulga: "", ognoo: "", description: "" },
    });

    useEffect(() => {
        setValue("destinationTypeID", destinationTypeIDs);
    }, [destinationTypeIDs, setValue]);

    const toggleDestination = (id) => {
        const sid = String(id);
        setDestinationTypeIDs((prev) => (prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]));
    };

    useEffect(() => {
        axios.get("/get/division").then((r) => setDivisions(normalize(r))).catch(() => setDivisions([]));
    }, []);

    const convertToBase64 = (e) => {
        for (let i = 0; i < e.target.files.length; i++) {
            const file = e.target.files[i];
            const fileNameExists = selectedfile.some((f) => f.filename === file.name);
            if (fileNameExists) {
                Swal.fire({ icon: "warning", text: `"${file.name}" аль хэдийн сонгосон байна.` });
                e.target.value = null;
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedFile((prev) => [
                    ...prev,
                    { id: nanoid(), filename: file.name, filetype: file.type, fileimage: reader.result, filesize: filesizes(file.size), file },
                ]);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = null;
    };

    const DeleteSelectFile = (id) => {
        setSelectedFile((prev) => prev.filter((d) => d.id !== id));
        setPreviewFile((prev) => (prev && prev.id === id ? null : prev));
    };

    const onSubmit = (data) => {
        if (!bichigID) return Swal.fire("Бичиг сонгогдоогүй байна.");
        const destIds = destinationTypeIDs.length ? destinationTypeIDs : (Array.isArray(data.destinationTypeID) ? data.destinationTypeID : []);
        if (destIds.length < 1) return Swal.fire("Хаашаа явсан хэсэгт дор хаяж 1 бүтцийн нэгж сонгоно уу.");
        const formData = new FormData();
        formData.append("bichigID", bichigID);
        destIds.forEach((id) => formData.append("destinationTypeID[]", id));
        formData.append("dugaar", data.dugaar);
        formData.append("aguulga", data.aguulga);
        formData.append("ognoo", data.ognoo);
        if (data.description) formData.append("description", data.description);
        selectedfile.forEach((item) => {
            if (item.file) formData.append("pdf[]", item.file);
        });

        axios
            .post("/new/bichig/hariu", formData)
            .then((res) => {
                Swal.fire(res.data.msg);
                setSelectedFile([]);
                setPreviewFile(null);
                if (fileInputRef.current) fileInputRef.current.value = null;
                setDestinationTypeIDs([]);
                reset({ destinationTypeID: [], dugaar: "", aguulga: "", ognoo: "", description: "" });
                refreshHariu();
                if (onClose) onClose();
                if (window.$) window.$("#HariuNew").modal("hide");
            })
            .catch((err) => Swal.fire(err.response?.data?.msg || "Алдаа гарлаа."));
    };

    if (!bichigID) return null;

    return (
        <div className="modal" id="HariuNew">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">Хариу бичиг нэмэх</h4>
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
                                    <label>Огноо, цаг</label>
                                    <input type="datetime-local" className="form-control mb-2" {...register("ognoo")} />
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
                                    <label>Хаашаа явсан (дор хаяж 1 бүтцийн нэгж сонгоно)</label>
                                    <div className="border rounded p-2 mb-2" style={{ maxHeight: "160px", overflowY: "auto" }}>
                                        {divisions.map((d) => (
                                            <div key={d.id} className="custom-control custom-checkbox">
                                                <input
                                                    type="checkbox"
                                                    className="custom-control-input"
                                                    id={`hariu-dest-new-${d.id}`}
                                                    checked={destinationTypeIDs.includes(String(d.id))}
                                                    onChange={() => toggleDestination(d.id)}
                                                />
                                                <label className="custom-control-label" htmlFor={`hariu-dest-new-${d.id}`}>
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
                                        <input type="file" accept=".pdf,.doc,.docx" multiple hidden onChange={convertToBase64} ref={fileInputRef} />
                                    </label>
                                    {selectedfile.length === 0 && (
                                        <div className="text-muted text-center py-2 border rounded">Хавсралт файл сонгогдоогүй байна</div>
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
                            <button type="submit" className="btn btn-success">Нэмэх</button>
                            <button type="button" className="btn btn-danger" data-dismiss="modal">Хаах</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HariuNew;
