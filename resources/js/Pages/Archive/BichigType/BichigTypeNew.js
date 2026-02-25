import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import * as Yup from "yup";
import axios from "../../../AxiosUser";

const BichigTypeNew = (props) => {
    const formSchema = Yup.object().shape({
        typeName: Yup.string().required("Төрөл нэр оруулна уу."),
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
            .post("/new/bichig/type", {
                typeName: data.typeName,
                description: data.description || null,
            })
            .then((res) => {
                Swal.fire(res.data.msg);
                reset(
                    { typeName: "", description: "" },
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
        <div className="modal" id="bichigTypeNew">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">
                            Баримт бичгийн төрөл нэмэх
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
                                            Төрөл нэр:
                                        </span>
                                    </div>
                                    <input
                                        {...register("typeName")}
                                        className="form-control"
                                        placeholder="Төрөл нэр"
                                    />
                                </div>
                                <p className="alerts">
                                    {errors.typeName?.message}
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

export default BichigTypeNew;
