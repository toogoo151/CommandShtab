import { useEffect, useState } from "react";
import CountUp from "react-countup";
import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import axios from "../../../AxiosUser";
const Graphic = () => {
    const [irsenbichiCount, setirsenbichigCount] = useState(0);
    const [uurtirsenbichiCount, setuurtirsenbichiCount] = useState(0);

    const [HariutaiCount, setHariutaiCount] = useState(0);
    const [HariuguiCount, setHariuguiCount] = useState(0);
    const [HugatsaaHetersenCount, setHugatsaaHetersenCount] = useState(0);
    const [UserCount, setUserCount] = useState(0);
    const [HariuIrsenCount, setHariuIrsenCount] = useState(0);
    const [HugatsaaHetersen, setHugatsaaHetersen] = useState(0);
    const [BichigTypeCount, setBichigType] = useState([]);
    const [BelenzeregCount, setBelenzeregCount] = useState([]);
    const [HetersenHugatsaaCount, setHetersenHugatsaa] = useState([]);

    const [selectedJname, setSelectedJname] = useState(0);
    const [getJname, setGetJname] = useState([]);

    const RADIAN = Math.PI / 180;

    const renderLabel = ({ cx, cy, midAngle, outerRadius, percent }) => {
        const radius = outerRadius + 15; // гадна гаргах зай
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="#333"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
                style={{ fontSize: 13, fontWeight: 600 }}
            >
                {(percent * 100).toFixed(0)}%
            </text>
        );
    };

    const COLORS = [
        "url(#color1)",
        "url(#color2)",
        "url(#color3)",
        "url(#color4)",
    ];

    const PieGraph = ({ title, data }) => {
        const total = data.reduce((sum, item) => sum + item.value, 0);

        const renderLabel = ({ percent }) => `${(percent * 100).toFixed(0)}%`;

        return (
            <div className="col-xl-4 col-md-6 col-sm-12">
                <div
                    style={{
                        background: "linear-gradient(135deg,#ffffff,#f6f9ff)",
                        borderRadius: 18,
                        padding: 20,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                        transition: ".3s",
                    }}
                    className="hover-card"
                >
                    <h6
                        style={{
                            textAlign: "center",
                            fontWeight: 700,
                            marginBottom: 10,
                        }}
                    >
                        {title}
                    </h6>

                    <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                            {/* Gradient өнгө */}
                            <defs>
                                <linearGradient id="color1">
                                    <stop offset="0%" stopColor="#4776E6" />
                                    <stop offset="100%" stopColor="#8E54E9" />
                                </linearGradient>

                                <linearGradient id="color2">
                                    <stop offset="0%" stopColor="#00c9ff" />
                                    <stop offset="100%" stopColor="#92fe9d" />
                                </linearGradient>

                                <linearGradient id="color3">
                                    <stop offset="0%" stopColor="#ff416c" />
                                    <stop offset="100%" stopColor="#ff4b2b" />
                                </linearGradient>

                                <linearGradient id="color4">
                                    <stop offset="0%" stopColor="#f7971e" />
                                    <stop offset="100%" stopColor="#ffd200" />
                                </linearGradient>
                            </defs>

                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={65}
                                outerRadius={95}
                                paddingAngle={4}
                                label={renderLabel}
                                animationDuration={1200}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={index}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>

                            {/* Center text */}
                            <text
                                x="50%"
                                y="50%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                style={{
                                    fontSize: 20,
                                    fontWeight: 700,
                                }}
                            >
                                {total}
                            </text>

                            <Tooltip />

                            <Legend iconType="circle" verticalAlign="bottom" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };
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
        }
    }, [selectedJname, , getJname]);

    const bichigData = [
        { name: "Ирсэн", value: uurtirsenbichiCount },
        { name: "Явсан", value: irsenbichiCount },
    ];

    const hariuData = [
        { name: "Хариутай", value: HariutaiCount },
        { name: "Хариугүй", value: HariuguiCount },
    ];

    const hugatsaaData = [
        {
            name: "Хугацаа хэтэрсэн",
            value: HugatsaaHetersenCount,
        },
        {
            name: "Хариу ирсэн",
            value: HariuIrsenCount,
        },
    ];
    const refreshStatic = (divisionID = 0) => {
        axios
            .post("/get/IrsenBichigBarimt", {
                divisionID,
            })
            .then((res) => setirsenbichigCount(res.data));

        axios.post("/get/HetersenHugatsaa").then((res) => {
            const data = res.data.map((el) => ({
                name: el.nickName,
                value: el.total,
            }));

            setHetersenHugatsaa(data);
        });

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
            .post("/get/BichigTypeCount", {
                divisionID,
            })
            .then((res) => {
                const pieData = res.data.map((el) => ({
                    name: el.typeName,
                    value: el.total,
                }));

                setBichigType(pieData);
            });

        axios
            .post("/get/BelenzeregCount", {
                divisionID,
            })
            .then((res) => {
                const pieData = res.data.map((el) => ({
                    name: el.belenBaidalName,
                    value: el.total,
                }));

                setBelenzeregCount(pieData);
            });

        // axios
        //     .post("/get/BichigTypeCount", {
        //         divisionID,
        //     })
        //     .then((res) => {
        //         setBichigType(res.data);
        //     });

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
        axios
            .post("/get/HariuIrsenCount", {
                divisionID,
            })
            .then((res) => {
                console.log(res.data);
                setHariuIrsenCount(res.data);
            });
        axios
            .post("/get/HugatsaaHetersen", {
                divisionID,
            })
            .then((res) => {
                console.log(res.data);
                setHugatsaaHetersen(res.data);
            });
    };

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

            <div className="row g-3" style={{ marginBottom: "30px" }}>
                {" "}
                <PieGraph
                    title="Ирсэн / Явсан баримт бичиг"
                    data={bichigData}
                />
                <PieGraph
                    title="Хариутай / Хариугүй баримт бичиг"
                    data={hariuData}
                />
                <PieGraph
                    title="Хугацаа хэтэрсэн/ Хариу өгсөн баримт бичиг"
                    data={hugatsaaData}
                />
            </div>

            <div className="row g-3" style={{ marginBottom: "30px" }}>
                <PieGraph title="Баримт бичгийн төрөл" data={BichigTypeCount} />

                <PieGraph
                    title="Бэлэн байдлын зэргээр бүртгэгдсэн баримт бичиг"
                    data={BelenzeregCount}
                />

                <PieGraph
                    title="Баримт бичигт нийт хугацаа хэтэрсэн минут"
                    data={HetersenHugatsaaCount}
                />
            </div>
            {/* Hover and gradient animation CSS */}
            <style>{`
     
          .hover-card:hover{

transform:translateY(-6px) scale(1.02);

box-shadow:
0 20px 45px rgba(0,0,0,0.2);

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

export default Graphic;
