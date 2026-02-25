import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "../../../AxiosUser";

const normalizeArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.data)) return res.data.data;
    return [];
};

const UserEdit = ({ changeDataRow, refreshUser, setRowsSelected, isEditBtnClick }) => {
    const [divisionID, setDivisionID] = useState("");
    const [userType, setUserType] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [getDataRow, setDataRow] = useState({});
    const [getDivision, setDivision] = useState([]);

    useEffect(() => {
        axios
            .get("/get/division")
            .then((res) => setDivision(normalizeArray(res)))
            .catch(() => setDivision([]));
    }, []);

    useEffect(() => {
        if (!changeDataRow || !changeDataRow.id) return;
        const row = changeDataRow;
        setDataRow(row);
        setDivisionID(String(row.divisionIDshuu ?? row.divisionID ?? ""));
        setUserType(String(row.userType ?? ""));
        setEmail(String(row.email ?? ""));
        setPassword("");
    }, [changeDataRow]);

    const saveUser = () => {
        if (!divisionID) return Swal.fire("Бүтцийн нэгж сонгоно уу.");
        if (!userType) return Swal.fire("Хэрэглэгчийн түвшин сонгоно уу.");
        if (!email || !email.trim()) return Swal.fire("Цахим хаяг оруулна уу.");

        const payload = {
            id: getDataRow.id,
            divisionID,
            userType,
            email: email.trim(),
        };
        if (password && password.trim() !== "") payload.password = password;

        axios
            .post("/edit/user", payload)
            .then((res) => {
                Swal.fire(res.data?.msg || "Амжилттай заслаа.");
                if (typeof refreshUser === "function") refreshUser();
                if (typeof setRowsSelected === "function") setRowsSelected([]);
            })
            .catch((err) =>
                Swal.fire(err.response?.data?.msg || "Алдаа гарлаа!")
            );
    };

    return (
        <div className="modal" id="userEdit">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">Хэрэглэгч засах</h4>
                        <button
                            data-dismiss="modal"
                            className="close"
                            type="button"
                        >
                            &times;
                        </button>
                    </div>
                    <div className="modal-body">
                        {/* Бүтцийн нэгж */}
                        <div className="row mb-2">
                            <div className="col-md-3">Бүтцийн нэгж:</div>
                            <div className="col-md-9">
                                <select
                                    className="form-control"
                                    value={divisionID}
                                    onChange={(e) => setDivisionID(e.target.value)}
                                >
                                    <option value="">Сонгоно уу</option>
                                    {getDivision.map((el) => (
                                        <option key={el.id} value={String(el.id)}>
                                            {el.nickName ?? el.ner ?? el.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Хэрэглэгчийн түвшин */}
                        <div className="row mb-2">
                            <div className="col-md-3">Хэрэглэгчийн түвшин:</div>
                            <div className="col-md-9">
                                <select
                                    className="form-control"
                                    value={userType}
                                    onChange={(e) => setUserType(e.target.value)}
                                >
                                    <option value="">Сонгоно уу</option>
                                    <option value="1">Админ</option>
                                    <option value="2">Бүтцийн нэгжийн админ</option>
                                </select>
                            </div>
                        </div>

                        {/* Цахим хаяг */}
                        <div className="input-group mb-3">
                            <span className="input-group-text">Цахим хаяг:</span>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Нууц үг */}
                        <div className="input-group mb-3">
                            <span className="input-group-text">Нууц үг:</span>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Шинэ нууц үг оруулбал солигдоно"
                            />
                            <span
                                className="input-group-text"
                                style={{ cursor: "pointer" }}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button className="btn btn-success" onClick={saveUser}>
                            Засах
                        </button>
                        <button data-dismiss="modal" className="btn btn-danger" type="button">
                            Хаах
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserEdit;
