import { useEffect, useState } from "react";
import CountUp from "react-countup";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import axios from "../../../AxiosUser";
const CompareGraphic = () => {
    const [hetersenData, setHetersenData] = useState([]);
    const [compareData, setCompareData] = useState([]);

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

    const HariuBarGraph = ({ title, data }) => {
        const keys = Object.keys(data[0] ?? {}).filter((k) => k !== "name");

        // өнгө
        const COLORS = ["#4776E6", "#ff416c", "#00c6ff", "#00b09b", "#f7971e"];

        return (
            <div className="col-xl-6 col-md-12">
                <div
                    style={{
                        background: "#fff",
                        borderRadius: "14px",
                        padding: "20px",
                        boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
                    }}
                >
                    <h5
                        style={{
                            fontWeight: 600,
                            marginBottom: "10px",
                        }}
                    >
                        {title}
                    </h5>

                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={data}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                opacity={0.3}
                            />

                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />

                            <YAxis />

                            <Tooltip
                                contentStyle={{
                                    borderRadius: "10px",
                                    border: "none",
                                    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                                }}
                            />

                            <Legend />

                            {keys.map((key, index) => (
                                <Bar
                                    key={index}
                                    dataKey={key}
                                    name={key}
                                    radius={[8, 8, 0, 0]} // дугуй орой
                                    fill={COLORS[index % COLORS.length]}
                                    animationDuration={1200}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };
    useEffect(() => {
        axios.post("/get/DivisionCompareGraphic", {}).then((res) => {
            setCompareData(res.data);
        });

        axios.post("/get/DivisionHetersenGraphic", {}).then((res) => {
            setHetersenData(res.data);
        });
    }, []);

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
                        📊 Харьцуулсан тоон үзүүлэлт
                    </h2>
                    <p style={{ color: "#555", fontSize: "14px" }}>
                        Системийн ерөнхий мэдээлэл
                    </p>
                </div>
            </div>
            <div className="row gy-4">
                <div className="col-xl-12 col-md-12">
                    <HariuBarGraph
                        title="Ирсэн / Явсан баримт бичиг"
                        data={compareData}
                    />
                </div>

                <div
                    className="col-xl-12 col-md-12"
                    style={{ marginBottom: "30px" }}
                >
                    <HariuBarGraph
                        title="Хугацаа хэтэрсэн баримт бичиг"
                        data={hetersenData}
                    />
                </div>
            </div>

            {/* <div className="col-xl-6 col-md-12">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={compareData}>
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="name" />

                        <YAxis />

                        <Tooltip />

                        <Legend />

                        <Bar dataKey="irsen" name="Ирсэн" fill="#4776E6" />

                        <Bar dataKey="yavsan" name="Явсан" fill="#ff416c" />
                    </BarChart>
                </ResponsiveContainer>
            </div> */}

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

export default CompareGraphic;
