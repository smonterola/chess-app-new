import { useRef, useState } from "react";
import "./Menu.css";
import Tile from "../Tile/Tile";

export default function Menu() {
    const menuRef = useRef<HTMLDivElement>(null);
    const menuUI = [];
    for (let i = 0; i < 8; i++) {
        const number = i;
        menuUI.push(<Tile key={`${i}${1}`} image={undefined} number={number} highlight={false} menu={true}/>)
    }
    return (
        <div
            id="menu"
            ref={menuRef}
        >
            {menuUI}
        </div>
    );
}