import { useContext, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Link, useLocation, useNavigate } from "react-router-dom";
import user2 from "../../../../../dist/img/userIcon.png";
import axios from "../../../../AxiosUser";
import { AppContext } from "../../../../Context/MyContext";
import "./sidebar-modern.css";

export default function AsideMenu() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentUrl = location.pathname;

    const state = useContext(AppContext);
    const [getName11, setName] = useState("");
    const [getTuvshin, setTuvshin] = useState("");
    const [openMenu, setOpenMenu] = useState({});
    const [openSubMenu, setOpenSubMenu] = useState({});

    const menuData = [
        { type: "header", label: "ҮНДСЭН" },
        {
            type: "menu",
            title: "Баримт бичиг",
            icon: "fa fa-th-large",
            level: [1, 2, 3],
            subMenu: [
                {
                    name: "Ирсэн баримт бичиг",
                    url: "/irsen/bichig",
                    icon: "fa fa-list",
                },

                {
                    name: "Явсан баримт бичиг",
                    url: "/ywsan/bichig",
                    icon: "fa fa-list",
                },
            ],
        },

        { type: "header", label: "Нэмэлт мэдээлэл" },
        {
            type: "menu",
            title: "Бүтэц",
            icon: "fa fa-user",
            level: [1, 2, 3],
            subMenu: [
                {
                    name: "Бүтцийн нэгжүүд",
                    url: "/divisions",
                    icon: "fa fa-flag",
                },
                { name: "Хэрэглэгчид", url: "/users", icon: "fa fa-users" },
            ],
        },
        {
            type: "menu",
            title: "Туслах сан",
            icon: "fa fa-user",
            level: [1],
            subMenu: [
                {
                    name: "Баримт бичиг",
                    url: "/bichig/category",
                    icon: "fa fa-flag",
                },
                {
                    name: "Баримт бичгийн төрөл",
                    url: "/bichig/type",
                    icon: "fa fa-flag",
                },
                {
                    name: "Бэлэн байдлын зэрэг",
                    url: "/zereg",
                    icon: "fa fa-flag",
                },
                {
                    name: "Баримт бичгийн ангилал",
                    url: "/bichig/angilal",
                    icon: "fa fa-flag",
                },
            ],
        },
        {
            type: "menu",
            title: "Статистик",
            icon: "fa fa-signal",
            level: [1, 2, 3],
            subMenu: [
                {
                    name: "Тоон үзүүлэлт",
                    url: "/get/statistic",
                    icon: "fa fa-bar-chart",
                },
                {
                    name: "График үзүүлэлт",
                    url: "/get/graphic",
                    icon: "fa fa-pie-chart",
                },
            ],
        },

    ];

    useEffect(() => {
        axios
            .get("/get/divisionName")
            .then((res) => {
                // Хэрэв серверээс массив ирж байвал эхний элементийг авна
                if (res.data && res.data.length > 0) {
                    setName(res.data[0].nickName);
                }
            })
            .catch((err) => {
                console.error("Division name load failed:", err);
            });
        // axios.get("/get/divisionName").then((res) => {
        //     setName(res.data);
        // });

        axios.get("/get/auth/tuvshin").then((res) => {
            setTuvshin(res.data);
        });
    }, []);

    useEffect(() => {
        const menuState = {};
        const subMenuState = {};

        menuData.forEach((menu, menuIndex) => {
            if (menu.type !== "menu") return;

            menu.subMenu.forEach((sub, subIndex) => {
                // 🔹 Энгийн submenu
                if (sub.url === currentUrl) {
                    menuState[menuIndex] = true;
                }

                // 🔹 Children-тэй submenu
                if (sub.children) {
                    sub.children.forEach((child) => {
                        if (child.url === currentUrl) {
                            menuState[menuIndex] = true;
                            subMenuState[`${menuIndex}-${subIndex}`] = true;
                        }
                    });
                }
            });
        });

        setOpenMenu(menuState);
        setOpenSubMenu(subMenuState);
    }, [currentUrl]);

    const resetContextIsMission = () => {
        localStorage.removeItem("whatIsMission");
        navigate("/home");
    };

    return (
        <aside className="main-sidebar elevation-4">
            <a className="brand-link" onClick={resetContextIsMission}>
                СТРАТЕГИ КОМАНД ШТАБ
            </a>

            <div className="sidebar">
                {/* USER PANEL */}
                <div className="user-panel mt-3 pb-3 mb-3 d-flex align-items-center">
                    <div className="image">
                        <div className="image">
                            <img
                                src={user2}
                                className="img-circle elevation-2"
                                width={40}
                            />
                        </div>
                        <div className="info ml-2">
                            <span style={{ textAlign: "center" }}>
                                {getName11}
                            </span>{" "}
                        </div>
                    </div>
                </div>

                {/* MENU */}
                <nav className="mt-2">
                    <ul className="nav nav-pills nav-sidebar flex-column">
                        {menuData.map((item, idx) => {
                            if (item.type === "header") {
                                return (
                                    <li
                                        key={idx}
                                        className="nav-header"
                                        style={{
                                            background: "#194999", // very soft blue background
                                            color: "#efefef", // slightly darker blue text
                                            padding: "10px 12px",
                                            borderRadius: 8,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            letterSpacing: 0.5,
                                            boxShadow:
                                                "0 1px 4px rgba(0,0,0,0.1)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                            whiteSpace: "normal",
                                            wordWrap: "break-word",
                                            borderLeft: "4px solid #efefef", // soft blue accent bar
                                        }}
                                    >
                                        <i
                                            className="fa fa-folder"
                                            style={{ color: "#FFD700" }}
                                        />
                                        <span
                                            style={{
                                                display: "inline-block",
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {item.label}
                                        </span>
                                    </li>
                                );
                            }

                            if (item.type === "menu") {
                                if (!item.level.includes(Number(getTuvshin)))
                                    return null;

                                const isOpen = openMenu[idx] || false;
                                const toggleMenu = () =>
                                    setOpenMenu((prev) => ({
                                        ...prev,
                                        [idx]: !prev[idx],
                                    }));

                                return (
                                    <li
                                        key={idx}
                                        className={`nav-item ${
                                            isOpen ? "menu-open" : ""
                                        }`}
                                    >
                                        <a
                                            className="nav-link"
                                            onClick={toggleMenu}
                                            style={{
                                                cursor: "pointer",
                                                color: isOpen ? "#fff" : "#DDD",
                                                background: isOpen
                                                    ? "rgba(102,126,234,0.15)"
                                                    : "transparent",
                                                borderRadius: 8,
                                                margin: "5px 10px",
                                                padding: "12px 15px",
                                                fontWeight: 600,
                                                borderLeft: isOpen
                                                    ? "3px solid #667eea"
                                                    : "3px solid transparent",
                                                transition: "all 0.2s",
                                            }}
                                        >
                                            <i
                                                className={item.icon}
                                                style={{ marginRight: 10 }}
                                            />
                                            <p>
                                                {item.title}{" "}
                                                <i className="right fa fa-angle-left" />
                                            </p>
                                        </a>
                                        <ul
                                            className="nav nav-treeview"
                                            style={{
                                                paddingLeft: 12,
                                                display: isOpen
                                                    ? "block"
                                                    : "none",
                                            }}
                                        >
                                            {item.subMenu.map((sub, i) => {
                                                /** 🔹 Данс бүртгэл (children-тэй) */
                                                if (sub.children) {
                                                    const key = `${idx}-${i}`;
                                                    const isSubOpen =
                                                        openSubMenu[key] ||
                                                        false;

                                                    return (
                                                        <li
                                                            key={key}
                                                            className={`nav-item ${
                                                                isSubOpen
                                                                    ? "menu-open"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <a
                                                                className="nav-link"
                                                                onClick={() =>
                                                                    setOpenSubMenu(
                                                                        (
                                                                            p
                                                                        ) => ({
                                                                            ...p,
                                                                            [key]: !p[
                                                                                key
                                                                            ],
                                                                        })
                                                                    )
                                                                }
                                                                style={{
                                                                    cursor: "pointer",
                                                                    paddingLeft: 30,
                                                                }}
                                                            >
                                                                <i
                                                                    className={
                                                                        sub.icon
                                                                    }
                                                                    style={{
                                                                        marginRight: 12,
                                                                        fontSize: 16,
                                                                        width: 18,
                                                                        textAlign:
                                                                            "center",
                                                                    }}
                                                                />
                                                                {/* <i
                                                                    className={
                                                                        sub.icon
                                                                    }
                                                                /> */}
                                                                <p>
                                                                    {sub.name}
                                                                    <i
                                                                        className="right fa fa-angle-left"
                                                                        style={{
                                                                            transition:
                                                                                "transform 0.25s ease",
                                                                            transform:
                                                                                isSubOpen
                                                                                    ? "rotate(-90deg)"
                                                                                    : "rotate(0deg)",
                                                                        }}
                                                                    />
                                                                </p>
                                                            </a>

                                                            <ul className="nav nav-treeview">
                                                                {sub.children.map(
                                                                    (
                                                                        child,
                                                                        c
                                                                    ) => (
                                                                        <li
                                                                            key={
                                                                                c
                                                                            }
                                                                            className="nav-item"
                                                                        >
                                                                            <Link
                                                                                to={
                                                                                    child.url
                                                                                }
                                                                                className="nav-link"
                                                                                style={{
                                                                                    paddingLeft: 45,
                                                                                    borderRadius: 8,
                                                                                    color:
                                                                                        currentUrl ===
                                                                                        child.url
                                                                                            ? "#fff"
                                                                                            : "#cbd5e1",
                                                                                    background:
                                                                                        currentUrl ===
                                                                                        child.url
                                                                                            ? "linear-gradient(90deg,#667eea,#764ba2)"
                                                                                            : "transparent",
                                                                                    transition:
                                                                                        "all 0.2s ease",
                                                                                }}
                                                                            >
                                                                                <i
                                                                                    className={`nav-icon ${child.icon}`}
                                                                                />
                                                                                <p>
                                                                                    {
                                                                                        child.name
                                                                                    }
                                                                                </p>
                                                                            </Link>
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        </li>
                                                    );
                                                }

                                                /** 🔹 Энгийн submenu */
                                                return (
                                                    <li
                                                        key={i}
                                                        className="nav-item"
                                                    >
                                                        <Link
                                                            to={sub.url}
                                                            className={`nav-link ${
                                                                currentUrl ===
                                                                sub.url
                                                                    ? "active"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <i
                                                                className={`nav-icon ${sub.icon}`}
                                                            />
                                                            <p>{sub.name}</p>
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </li>
                                );
                            }

                            return null;
                        })}
                    </ul>
                </nav>
            </div>
        </aside>
    );
}

// React 18 way
const container = document.getElementById("asideMenu");
if (container) {
    const root = createRoot(container);
    root.render(<AsideMenu />);
}
