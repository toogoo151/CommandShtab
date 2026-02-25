import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import * as Yup from "yup";
import axios from "../../../AxiosUser";

const UserNew = ({ refreshUser }) => {
    const [getDivision, setDivision] = useState([]);

    // -------------------- Load Data --------------------
    useEffect(() => {
        axios
            .get("/get/division")
            .then((res) => setDivision(res.data))
            .catch((err) => console.log(err));
    }, []);

    // -------------------- Form Validation --------------------
    const formSchema = Yup.object().shape({
        divisionID: Yup.string().required("Бүтцийн нэгж сонгоно уу."),
        userType: Yup.string().required("Хэрэглэгчийн түвшин сонгоно уу."),
        email: Yup.string().required("Цахим хаяг оруулна уу."),
        password: Yup.string().required("Нууц үг оруулна уу."),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        mode: "onTouched",
        resolver: yupResolver(formSchema),
    });

    // -------------------- Submit --------------------
    const onSubmit = (data) => {
        axios
            .post("/new/user", {
                divisionID: data.divisionID,
                userType: data.userType,
                email: data.email,
                password: data.password,
            })
            .then((res) => {
                Swal.fire(res.data.msg);
                reset({
                    divisionID: "",
                    userType: "",
                    email: "",
                    password: "",
                });
                refreshUser();
            })
            .catch((err) => {
                Swal.fire(err.response.data.msg || "Алдаа гарлаа!");
            });
    };

    // -------------------- Render --------------------
    return (
        <div className="modal" id="userNew">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    {/* Header */}
                    <div className="modal-header">
                        <h4 className="modal-title">Хэрэглэгч нэмэх</h4>
                        <button
                            type="button"
                            className="close"
                            data-dismiss="modal"
                        >
                            ×
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="modal-body">
                            {/* Бүтцийн нэгж */}
                            <div className="row">
                                <div className="input-group mb-3">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">
                                            Бүтцийн нэгж:
                                        </span>
                                    </div>
                                    <select
                                        className="form-control"
                                        {...register("divisionID")}
                                    >
                                        <option value="">Сонгоно уу</option>
                                        {getDivision.map((el) => (
                                            <option key={el.id} value={String(el.id)}>
                                                {el.nickName}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="alerts">
                                        {errors.divisionID?.message}
                                    </p>
                                </div>
                            </div>

                            {/* Хэрэглэгчийн түвшин */}
                            <div className="row">
                                <div className="input-group mb-3">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">
                                            Хэрэглэгчийн түвшин:
                                        </span>
                                    </div>
                                    <select
                                        className="form-control"
                                        {...register("userType")}
                                    >
                                        <option value="">Сонгоно уу</option>
                                        <option value="1">Админ</option>
                                        <option value="2">
                                            Бүтцийн нэгжийн админ
                                        </option>
                                    </select>
                                    <p className="alerts">
                                        {errors.userType?.message}
                                    </p>
                                </div>
                            </div>

                            {/* Цахим хаяг */}
                            <div className="row">
                                <div className="input-group mb-3">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">
                                            Цахим хаяг:
                                        </span>
                                    </div>
                                    <input
                                        {...register("email")}
                                        className="form-control"
                                    />
                                </div>
                                <p className="alerts">
                                    {errors.email?.message}
                                </p>
                            </div>
                            {/* Нууц үг */}
                            <div className="row">
                                <div className="input-group mb-3">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">
                                            Нууц үг:
                                        </span>
                                    </div>
                                    <input
                                        type="password"
                                        {...register("password")}
                                        className="form-control"
                                    />
                                </div>
                                <p className="alerts">
                                    {errors.password?.message}
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer">
                            <button type="submit" className="btn btn-success">
                                Нэмэх
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                data-dismiss="modal"
                            >
                                Хаах
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserNew;
