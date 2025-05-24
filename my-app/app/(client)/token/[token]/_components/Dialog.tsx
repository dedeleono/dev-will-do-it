"use client";
import { forwardRef, useImperativeHandle, useState } from "react";

const DialogEX = forwardRef(function DialogIH(props, ref) {
    const [isOpen, setIsOpen] = useState(true);

    useImperativeHandle(ref, () => ({
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
    }));

    return (
        <dialog open={isOpen}>
            <div>Hello div</div>
            <div>
                <button onClick={() => setIsOpen(true)}>Open</button>
            </div>
            <div>
                <button onClick={() => setIsOpen(false)}>Close</button>
            </div>
        </dialog>
    );
});

export default DialogEX;
