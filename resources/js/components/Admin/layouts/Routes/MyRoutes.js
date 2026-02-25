import { Navigate, Route, Routes } from "react-router-dom";

import BichigAngilal from "../../../../Pages/Archive/BichigAngilal/index";
import BichigCat from "../../../../Pages/Archive/BichigCat/index";
import BichigType from "../../../../Pages/Archive/BichigType/index";
import Divisions from "../../../../Pages/Archive/Division/index";
import Graphic from "../../../../Pages/Archive/Graphic/Graphic";
import Statistic from "../../../../Pages/Archive/Graphic/Statistic";
import Irsen from "../../../../Pages/Archive/IrsenBichig/index";
import User from "../../../../Pages/Archive/User/index";
import Ywsan from "../../../../Pages/Archive/YwsanBichig/index";
import Zereg from "../../../../Pages/Archive/Zereg/index";
import CompareGraphic from "../../../../Pages/Archive/Graphic/CompareGraphic";

// GANBAT NEMSEN TUR HADGALAH

import HomePage from "../../../../Pages/HomePage/HomePage";

// Туслах санд нэмэх

const MyRoutes = (props) => {
    const { handleFirstMenuClick, getMissionType } = props;
    return (
        <Routes>
            {/* 👉 Root redirect */}
            <Route path="/" element={<Navigate to="/home" />} />

            <Route
                path="/home"
                element={
                    <HomePage
                        handleFirstMenuClick={handleFirstMenuClick}
                        getMissionType={getMissionType}
                    />
                }
            />

            <Route path="/users" element={<User />} />
            <Route path="/divisions" element={<Divisions />} />
            <Route path="/bichig/category" element={<BichigCat />} />
            <Route path="/bichig/type" element={<BichigType />} />
            <Route path="/zereg" element={<Zereg />} />
            <Route path="/bichig/angilal" element={<BichigAngilal />} />
            <Route path="/get/statistic" element={<Statistic />} />
            <Route path="/get/graphic" element={<Graphic />} />
            <Route path="/irsen/bichig" element={<Irsen />} />
            <Route path="/ywsan/bichig" element={<Ywsan />} />
            <Route path="/get/Comparegraphic" element={<CompareGraphic />} />

            <Route path="*" element={<h1>Хуудас олдсонгүй</h1>} />
        </Routes>
    );
};

export default MyRoutes;
