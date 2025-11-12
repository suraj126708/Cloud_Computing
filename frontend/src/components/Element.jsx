import React from 'react'
import { TbRefresh } from "react-icons/tb";
const Element = ({ id, info, exId }) => {
    
    const handleResizeStart = (e, resizeId) => {
        e.preventDefault();
        e.stopPropagation();
        info.resizeElement(resizeId, info, e);
    };

    const handleRotateStart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        info.rotateElement(id, info, e);
    };
    
    return (
        <>
            {
                exId ? <>
                    <div 
                        onMouseDown={(e) => handleResizeStart(e, exId)} 
                        onClick={(e) => e.stopPropagation()}
                        className='resize-handle rounded-full border-2 border-white absolute block -bottom-[7px] -right-[7px] w-[14px] h-[14px] cursor-nwse-resize bg-purple-500 z-[99999] hover:bg-purple-600 transition-colors' 
                        title="Resize"
                    ></div>
                    <div 
                        onMouseDown={(e) => handleResizeStart(e, exId)} 
                        onClick={(e) => e.stopPropagation()}
                        className='resize-handle rounded-full border-2 border-white absolute block -top-[7px] -right-[7px] w-[14px] h-[14px] cursor-nesw-resize bg-purple-500 z-[99999] hover:bg-purple-600 transition-colors' 
                        title="Resize"
                    ></div>
                    <div 
                        onMouseDown={(e) => handleResizeStart(e, exId)} 
                        onClick={(e) => e.stopPropagation()}
                        className='resize-handle rounded-full border-2 border-white absolute block -bottom-[7px] -left-[7px] w-[14px] h-[14px] cursor-nesw-resize bg-purple-500 z-[99999] hover:bg-purple-600 transition-colors' 
                        title="Resize"
                    ></div>
                    <div 
                        onMouseDown={(e) => handleResizeStart(e, exId)} 
                        onClick={(e) => e.stopPropagation()}
                        className='resize-handle rounded-full border-2 border-white absolute block -top-[7px] -left-[7px] w-[14px] h-[14px] cursor-nwse-resize bg-purple-500 z-[99999] hover:bg-purple-600 transition-colors' 
                        title="Resize"
                    ></div>
                </> : <>
                    <div 
                        onMouseDown={(e) => handleResizeStart(e, id)} 
                        onClick={(e) => e.stopPropagation()}
                        className='resize-handle rounded-full border-2 border-white absolute block -bottom-[7px] -right-[7px] w-[14px] h-[14px] cursor-nwse-resize bg-purple-500 z-[99999] hover:bg-purple-600 transition-colors' 
                        title="Resize"
                    ></div>
                    <div 
                        onMouseDown={(e) => handleResizeStart(e, id)} 
                        onClick={(e) => e.stopPropagation()}
                        className='resize-handle rounded-full border-2 border-white absolute block -top-[7px] -right-[7px] w-[14px] h-[14px] cursor-nesw-resize bg-purple-500 z-[99999] hover:bg-purple-600 transition-colors' 
                        title="Resize"
                    ></div>
                    <div 
                        onMouseDown={(e) => handleResizeStart(e, id)} 
                        onClick={(e) => e.stopPropagation()}
                        className='resize-handle rounded-full border-2 border-white absolute block -bottom-[7px] -left-[7px] w-[14px] h-[14px] cursor-nesw-resize bg-purple-500 z-[99999] hover:bg-purple-600 transition-colors' 
                        title="Resize"
                    ></div>
                    <div 
                        onMouseDown={(e) => handleResizeStart(e, id)} 
                        onClick={(e) => e.stopPropagation()}
                        className='resize-handle rounded-full border-2 border-white absolute block -top-[7px] -left-[7px] w-[14px] h-[14px] cursor-nwse-resize bg-purple-500 z-[99999] hover:bg-purple-600 transition-colors' 
                        title="Resize"
                    ></div>
                </>
            }

            <div 
                onMouseDown={(e) => handleRotateStart(e)} 
                onClick={(e) => e.stopPropagation()}
                className='w-[25px] flex absolute justify-center cursor-pointer left-[50%] -translate-x-[50%] -top-14 items-center hover:bg-indigo-600 hover:text-white h-[25px] rounded-full border-2 border-slate-500 bg-white transition-colors'
                title="Rotate"
            >
                <TbRefresh />
            </div>

            {/* <div onMouseDown={() => info.moveElement(id, info)} className='hidden absolute group-hover:block -top-[3px] left-[50%] translate-[-50%,0%] w-[10px] h-[10px] cursor-nwse-resize bg-green-500 z-[99999] '></div>
           <div onMouseDown={() => info.moveElement(id, info)} className='hidden absolute group-hover:block top-[50%] -left-[3px] translate-[-0%,50%] w-[10px] h-[10px] cursor-nwse-resize bg-green-500 z-[99999] '></div>
           <div onMouseDown={() => info.moveElement(id, info)} className='hidden absolute group-hover:block top-[50%] -right-[3px] translate-[-0%,50%] w-[10px] h-[10px] cursor-nwse-resize bg-green-500 z-[99999] '></div>
           <div onMouseDown={() => info.moveElement(id, info)} className='hidden absolute group-hover:block -bottom-[3px] left-[50%] translate-[-50%,0%] w-[10px] h-[10px] cursor-nwse-resize bg-green-500 z-[99999] '></div> */}
        </>
    )
}

export default Element