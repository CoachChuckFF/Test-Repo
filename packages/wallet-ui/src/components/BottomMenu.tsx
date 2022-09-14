import React from "react";

export function BottomMenuSpacing() {
    return (
        <>
            {" "}
            <div className="BottomMenu relative opacity-0 grid-cols-3 flex py-3 items-center justify-around z-40 w-full text-4xl">
                <button className="bottonButton px-4">
                    Tokens
                    {}
                </button>
            </div>
        </>
    );
}
