import React from "react";

function Button(props: {
    buttonLabel: string;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}) {
    const { buttonLabel, onClick, className, disabled } = props;

    return (
        <>
            <button
                disabled={disabled}
                onClick={onClick}
                className={`${className}  h-10 min-w-fit 
       rounded  bg-clrSecondary py-2 px-4 font-sans text-xs font-medium uppercase text-white shadow-[_0px_7px_rgba(0,0,0,1)] hover:bg-clrDarkBlue focus:outline-none active:translate-y-[2px] active:bg-blue-400 active:shadow-[_0px_5px_rgba(20,20,20,.5)]`}
            >
                {buttonLabel}
            </button>
        </>
    );
}

export default Button;
