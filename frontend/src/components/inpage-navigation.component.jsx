import React, { useEffect, useRef, useState } from 'react'

export let activeTabLineRef;
export let activeTabRef;

function InPageNavigation({ routes, defaultHidden = [], defaultActiveIndex = 0, children }) {

    activeTabLineRef = useRef();
    activeTabRef = useRef();

    const [inPageNavIndex, setInPageNavIndex] = useState(defaultActiveIndex);

    useEffect(() => {
        changePageState(activeTabRef.current, defaultActiveIndex);
    }, [])

    const changePageState = (btn, i) => {
        // console.log(btn)
        let { offsetWidth, offsetLeft } = btn;

        activeTabLineRef.current.style.width = offsetWidth + 'px';
        activeTabLineRef.current.style.left = offsetLeft + 'px';

        setInPageNavIndex(i);
    }

    return (
        <>
            <div
                className='relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto'
            >
                {
                    routes.map((route, i) => {
                        return (
                            <button
                                ref={i == defaultActiveIndex ? activeTabRef : null}
                                key={i}
                                className={"p-4 px-5 capitalize " + (inPageNavIndex == i ? "text-black " : "text-dark-grey " + (defaultHidden.includes(route) ? " md:hidden" : " "))}
                                onClick={(e) => {
                                    changePageState(e.target, i)
                                }}
                            >
                                {route}
                            </button>
                        )
                    })
                }

                <hr ref={activeTabLineRef} className='absolute bottom-0 duration-300' />
            </div>

            {/* checking whats comming from children is an array */}
            {/* if it's an array, 
            we can render 0th element for 0th route : 'home' */}
            {/* 1st array element for 1st route : 'trending-blogs' */}
            {Array.isArray(children) ? children[inPageNavIndex] : children}
        </>
    )
}

export default InPageNavigation