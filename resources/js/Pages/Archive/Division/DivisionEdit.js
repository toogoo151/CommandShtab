import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "../../../AxiosUser";

const DivisionEdit = (props) => {
    const [showModal, setShowModal] = useState("");
    const [nickName, setNickName] = useState("");
    const [fullName, setFullName] = useState("");
    const [description, setDescription] = useState("");

    const [getDataRow, setDataRow] = useState([]);

    useEffect(() => {
        setDataRow(props.changeDataRow);
    }, [props.changeDataRow]);

    useEffect(() => {
        if (props.isEditBtnClick) {
            setNickName(props.changeDataRow.nickName);
            setFullName(props.changeDataRow.fullName);
            setDescription(props.changeDataRow.description);
        }
    }, [props.isEditBtnClick]);

    const saveDivision = () => {
        props.setRowsSelected([]);
        if (nickName == "" || nickName == null) {
            Swal.fire("Товч нэрээ оруулна уу");
            return;
        }
        if (fullName == "" || fullName == null) {
            Swal.fire("Бүтцийн нэгж оруулна уу.");
            return;
        }

        axios
            .post("/edit/division", {
                id: props.changeDataRow.id,
                nickName: nickName,
                fullName: fullName,
                description: description,
            })
            .then((res) => {
                Swal.fire(res.data.msg);
                setNickName("");
                setFullName("");
                setDescription("");
                if (window.$) {
                    window.$("#DivisionEdit").modal("hide");
                }

                props.refreshDivision();
            })
            .catch((err) => {
                Swal.fire(err.response.data.msg);
            });
    };

    const changeNickName = (e) => {
        setNickName(e.target.value);
    };
    const changeFullName = (e) => {
        setFullName(e.target.value);
    };
    const changeDescription = (e) => {
        setDescription(e.target.value);
    };

    return (
        <>
            <div className="modal" id="DivisionEdit">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">БҮТЦИЙН НЭГЖ ЗАСАХ</h4>

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
                                            Товч нэр:
                                        </span>
                                    </div>
                                    <input
                                        className="form-control"
                                        onChange={changeNickName}
                                        value={nickName}
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="input-group mb-3">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">
                                            Бүтцийн нэгж:
                                        </span>
                                    </div>
                                    <input
                                        className="form-control"
                                        onChange={changeFullName}
                                        value={fullName}
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
                                        onChange={changeDescription}
                                        value={description}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal footer */}
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-success"
                                data-dismiss=""
                                onClick={saveDivision}
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
        </>
    );
};

export default DivisionEdit;
