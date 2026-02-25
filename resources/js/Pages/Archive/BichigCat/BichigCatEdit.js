import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "../../../AxiosUser";

const BichigCatEdit = (props) => {
    const [catName, setCatName] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (props.isEditBtnClick && props.changeDataRow) {
            setCatName(props.changeDataRow.catName ?? "");
            setDescription(props.changeDataRow.description ?? "");
        }
    }, [props.isEditBtnClick, props.changeDataRow]);

    const saveEdit = () => {
        if (!catName || catName.trim() === "") {
            Swal.fire("Ангилал нэр оруулна уу.");
            return;
        }
        axios
            .post("/edit/bichig/category", {
                id: props.changeDataRow?.id,
                catName: catName.trim(),
                description: description?.trim() || null,
            })
            .then((res) => {
                Swal.fire(res.data.msg);
                setCatName("");
                setDescription("");
                if (window.$) {
                    window.$("#bichigCatEdit").modal("hide");
                }
                props.setRowsSelected([]);
                props.refreshData();
            })
            .catch((err) => {
                Swal.fire(err.response?.data?.msg || "Алдаа гарлаа.");
            });
    };

    return (
        <div className="modal" id="bichigCatEdit">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">Баримт бичиг ангилал засах</h4>
                        <button
                            type="button"
                            className="close"
                            data-dismiss="modal"
                        >
                            ×
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">
                                        Ангилал нэр:
                                    </span>
                                </div>
                                <input
                                    className="form-control"
                                    value={catName}
                                    onChange={(e) => setCatName(e.target.value)}
                                    placeholder="Ангилал нэр"
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">
                                        Тайлбар:
                                    </span>
                                </div>
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Тайлбар"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={saveEdit}
                        >
                            Засах
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            data-dismiss="modal"
                        >
                            Хаах
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BichigCatEdit;
