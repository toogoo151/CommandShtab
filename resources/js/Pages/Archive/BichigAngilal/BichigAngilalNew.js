import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import * as Yup from "yup";
import axios from "../../../AxiosUser";

const BichigAngilalNew = (props) => {
    const formSchema = Yup.object().shape({
        secretName: Yup.string().required("Төрөл нэр оруулна уу."),
        description: Yup.string(),
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

    const onSubmit = (data) => {
        axios
            .post("/new/bichig/angilal", {
                secretName: data.secretName,
                description: data.description || null,
            })
            .then((res) => {
                Swal.fire(res.data.msg);
                reset(
                    { secretName: "", description: "" },
                    {
                        keepIsSubmitted: false,
                        keepTouched: false,
                        keepIsValid: false,
                        keepSubmitCount: false,
                    }
                );
                props.refreshData();
            })
            .catch((err) => {
                Swal.fire(err.response?.data?.msg || "Алдаа гарлаа.");
            });
    };

    return (
        <div className="modal" id="BichigAngilalNew">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">
                            Баримт бичгийн ангилал нэмэх
                        </h4>
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
                                            Ангилал нэр:
                                        </span>
                                    </div>
                                    <input
                                        {...register("secretName")}
                                        className="form-control"
                                        placeholder="Ангилал нэр"
                                    />
                                </div>
                                <p className="alerts">
                                    {errors.secretName?.message}
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
    );
};

export default BichigAngilalNew;
