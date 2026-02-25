import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "../../../AxiosUser";

const BelenBaidalEdit = (props) => {
    const [belenBaidalName, setBelenBaidalName] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (props.isEditBtnClick && props.changeDataRow) {
            setBelenBaidalName(props.changeDataRow.belenBaidalName ?? "");
            setDescription(props.changeDataRow.description ?? "");
        }
    }, [props.isEditBtnClick, props.changeDataRow]);

    const saveEdit = () => {
        if (!belenBaidalName || belenBaidalName.trim() === "") {
            Swal.fire("Бэлэн байдлын зэрэг оруулна уу.");
            return;
        }
        axios
            .post("/edit/belen/baidal", {
                id: props.changeDataRow?.id,
                belenBaidalName: belenBaidalName.trim(),
                description: description?.trim() || null,
            })
            .then((res) => {
                Swal.fire(res.data.msg);
                setBelenBaidalName("");
                setDescription("");
                if (window.$) {
                    window.$("#belenBaidalEdit").modal("hide");
                }
                props.setRowsSelected([]);
                props.refreshData();
            })
            .catch((err) => {
                Swal.fire(err.response?.data?.msg || "Алдаа гарлаа.");
            });
    };

    return (
        <div className="modal" id="belenBaidalEdit">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">
                            Бэлэн байдлын зэрэг засах
                        </h4>
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
                                        Бэлэн байдлын зэрэг:
                                    </span>
                                </div>
                                <input
                                    className="form-control"
                                    value={belenBaidalName}
                                    onChange={(e) =>
                                        setBelenBaidalName(e.target.value)
                                    }
                                    placeholder="Бэлэн байдлын зэрэг"
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
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
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

export default BelenBaidalEdit;
