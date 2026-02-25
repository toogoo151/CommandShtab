import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { MdFolder, MdPerson } from "react-icons/md";
import axios from "../../../AxiosUser";

const Statistic = () => {
    // GANBAT
    const [irsenbichiCount, setirsenbichigCount] = useState(0);
    const [uurtirsenbichiCount, setuurtirsenbichiCount] = useState(0);

    const [HariutaiCount, setHariutaiCount] = useState(0);
    const [HariuguiCount, setHariuguiCount] = useState(0);
    const [HugatsaaHetersenCount, setHugatsaaHetersenCount] = useState(0);
    const [UserCount, setUserCount] = useState(0);

    const [selectedJname, setSelectedJname] = useState(0);
    const [getJname, setGetJname] = useState([]);

    useEffect(() => {
        refreshStatic(selectedJname);
    }, [selectedJname]);

    useEffect(() => {
        // Fetch distinct jName values
        axios
            .get("/get/DivisionName")
            .then((res) => {
                setGetJname(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    useEffect(() => {
        if (selectedJname !== 0) {
            const selectedJ = getJname.find(
                (el) => Number(el.id) === selectedJname
            );
            // filteredData = filteredData.filter(
            //     (item) =>
            //         String(item.jagsaalt_turul) === String(selectedJname) ||
            //         (selectedJ?.jName &&
            //             String(item.jagsaalt_turul) === String(selectedJ.jName))
            // );
        }
    }, [selectedJname, , getJname]);

    const refreshStatic = (divisionID = 0) => {
        axios
            .post("/get/IrsenBichigBarimt", {
                divisionID,
            })
            .then((res) => setirsenbichigCount(res.data));

        axios
            .post("/get/Hariutai", {
                divisionID,
            })
            .then((res) => setHariutaiCount(res.data));

        axios
            .post("/get/HariuguiCount", {
                divisionID,
            })
            .then((res) => setHariuguiCount(res.data));

        axios
            .post("/get/HugatsaaHetersenCount", {
                divisionID,
            })
            .then((res) => {
                setHugatsaaHetersenCount(res.data);
            });

        axios
            .post("/get/Usercount", {
                divisionID,
            })
            .then((res) => {
                setUserCount(res.data);
            });

        axios
            .post("/get/uurtirsenbichiCount", {
                divisionID,
            })
            .then((res) => {
                setuurtirsenbichiCount(res.data);
            });
    };

    // Card-ийн background өнгө
    const cardBackgrounds = [
        "#f0f8ff",
        "#ffe4e1",
        "#e6ffe6",
        "#fff5e6",
        "#e6f7ff",
        "#f3e8ff",
        "#fffbe6",
        "#e8fff8",
    ];
    const iconGradients = [
        "linear-gradient(270deg, #ff416c, #ff4b2b, #ffcc33, #ff416c)",
        "linear-gradient(270deg, #4776E6, #8E54E9, #6a11cb, #4776E6)",
        "linear-gradient(270deg, #11998e, #38ef7d, #11998e, #11998e)",
        "linear-gradient(270deg, #f7971e, #ffd200, #f7971e, #ffd200)",
        "linear-gradient(270deg, #00c9ff, #92fe9d, #00c9ff, #00c9ff)",
        "linear-gradient(270deg, #fc466b, #3f5efb, #6a11cb, #fc466b)",
        "linear-gradient(270deg, #ee0979, #ff6a00, #ffd200, #ee0979)",
        "linear-gradient(270deg, #56ab2f, #a8e063, #56ab2f, #a8e063)",
    ];

    const StatCard = ({ title, value, icon: Icon, cardBg, iconGradient }) => (
        <div className="col-xl-3 col-lg-3 col-md-6 col-sm-12">
            <div
                className="hover-card"
                style={{
                    backdropFilter: "blur(5px)",
                    background: cardBg,
                    borderRadius: "16px",
                    padding: "20px",
                    color: "#000",
                    boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    height: "100px",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        flex: 1,
                        whiteSpace: "wrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    <h6
                        style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#000",
                        }}
                    >
                        {title}
                    </h6>
                    <h2
                        style={{
                            fontWeight: "bold",
                            marginTop: "5px",
                            fontSize: "22px",
                            color: "#000",
                        }}
                    >
                        <CountUp end={value} duration={1.5} separator="," />
                    </h2>
                </div>

                <div
                    style={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        background: iconGradient,
                        backgroundSize: "400% 400%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 28,
                        animation: "gradientAnimation 10s ease infinite",
                        marginLeft: "10px",
                    }}
                >
                    <Icon />
                </div>
            </div>
        </div>
    );

    return (
        <div className="container-fluid">
            <div className="row mb-3">
                <div className="col-12 text-center">
                    <h2 style={{ fontWeight: "700", color: "#000" }}>
                        📊 Нийт тоон үзүүлэлт
                    </h2>
                    <p style={{ color: "#555", fontSize: "14px" }}>
                        Системийн ерөнхий мэдээлэл
                    </p>
                </div>
            </div>
            <div className="col-md-8 mb-3">
                <div className="input-group">
                    <span className="input-group-text">Бүтцийн нэгж:</span>

                    <select
                        className="form-control"
                        value={selectedJname}
                        onChange={(e) => {
                            const value = Number(e.target.value);
                            setSelectedJname(value);
                        }}
                    >
                        <option value={0}>Сонгоно уу</option>
                        {getJname.map((el) => (
                            <option key={el.id} value={el.id}>
                                {el.nickName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="row g-3">
                {/* Архив  */}
                <StatCard
                    title="Хэрэглэгчид"
                    value={UserCount}
                    icon={MdPerson}
                    cardBg={cardBackgrounds[3]}
                    iconGradient={iconGradients[3]}
                />
                <StatCard
                    title="Ирсэн баримт бичиг"
                    value={uurtirsenbichiCount}
                    icon={MdFolder}
                    cardBg={cardBackgrounds[0]}
                    iconGradient={iconGradients[0]}
                />
                <StatCard
                    title="Явсан баримт бичиг"
                    value={irsenbichiCount}
                    icon={MdFolder}
                    cardBg={cardBackgrounds[1]}
                    iconGradient={iconGradients[1]}
                />
                <StatCard
                    title="Баримт бичиг - Хариутай"
                    value={HariutaiCount}
                    icon={MdFolder}
                    cardBg={cardBackgrounds[3]}
                    iconGradient={iconGradients[3]}
                />
                <StatCard
                    title="Баримт бичиг - Хариугүй"
                    value={HariuguiCount}
                    icon={MdFolder}
                    cardBg={cardBackgrounds[4]}
                    iconGradient={iconGradients[4]}
                />
                <StatCard
                    title="Баримт бичиг хугацаа хэтэрсэн"
                    value={HugatsaaHetersenCount}
                    icon={MdFolder}
                    cardBg={cardBackgrounds[1]}
                    iconGradient={iconGradients[1]}
                />
            </div>
            {/* Hover and gradient animation CSS */}
            <style>{`
        .hover-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }

        @keyframes gradientAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
        </div>
    );
};

export default Statistic;
