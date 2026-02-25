import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import * as Yup from "yup";
import axios from "../../../AxiosUser";

const DivisionNew = (props) => {
    const formSchema = Yup.object().shape({
        nickName: Yup.string().required("Товч нэр оруулна уу."),
        fullName: Yup.string().required("Бүтцийн нэгж оруулна уу."),
    });
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        getValues,
        setValue,
    } = useForm({
        mode: "onTouched",
        resolver: yupResolver(formSchema),
    });

    const onSubmit = (data) => {
        axios
            .post("/new/division", {
                nickName: data.nickName,
                fullName: data.fullName,
                description: data.description,
            })
            .then((res) => {
                Swal.fire(res.data.msg);
                reset(
                    {
                        nickName: "",
                        fullName: "",
                        description: "",
                    },
                    {
                        keepIsSubmitted: false,
                        keepTouched: false,
                        keepIsValid: false,
                        keepSubmitCount: false,
                    }
                );
                props.refreshDivision();
            })
            .catch((err) => {
                Swal.fire(err.response.data.msg);
            });
    };

    return (
        <>
            <div className="modal" id="DivisionNew">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        {/* Modal Header */}
                        <div className="modal-header">
                            <h4 className="modal-title">Бүтцийн нэгж нэмэх</h4>

                            <button
                                type="button"
                                className="close"
                                data-dismiss="modal"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="input-group mb-3">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">
                                                Товч нэр:
                                            </span>
                                        </div>
                                        <input
                                            {...register("nickName")}
                                            className="form-control"
                                        />
                                    </div>
                                    <p className="alerts">
                                        {errors.nickName?.message}
                                    </p>
                                </div>
                                <div className="row">
                                    <div className="input-group mb-3">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">
                                                Бүтцийн нэгж:
                                            </span>
                                        </div>
                                        <input
                                            {...register("fullName")}
                                            className="form-control"
                                        />
                                    </div>
                                    <p className="alerts">
                                        {errors.fullName?.message}
                                    </p>
                                </div>
                                <div className="row">
                                    <div className="input-group mb-3">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">
                                                Тайлбар:
                                            </span>
                                        </div>
                                        <textarea
                                            {...register("description")}
                                            className="form-control"
                                            rows={3}
                                            placeholder="Тайлбар"
                                        />
                                    </div>
                                    <p className="alerts">
                                        {errors.description?.message}
                                    </p>
                                </div>
                            </div>

                            {/* Modal footer */}
                            <div className="modal-footer">
                                <button
                                    type="submit"
                                    className="btn btn-success"
                                    data-dismiss=""
                                >
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
        </>
    );
};

export default DivisionNew;
