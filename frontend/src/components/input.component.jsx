import React, { useState } from 'react'

function InputBox({ name, type, id, value, placeholder, icon }) {
    const [passwordVisible, setPasswordVisible] = useState(false);

    return (
        <div className='relative w-[100%] mb-4'>
            <input
                name={name}
                type={
                    type == 'password' ? passwordVisible ? "text" : 'password'
                    :
                    type
                }
                defaultValue={value}
                placeholder={placeholder}
                id={id}
                className='input-box'
            />
            <i className={'fi ' + icon + ' input-icon'}></i>

            {/* check type == password and display show hide password icon for the field */}
            {
                type == 'password' ?
                    <i className={'fi fi-rr-eye' + (!passwordVisible ? '-crossed' : '') + ' input-icon left-[auto] right-4 cursor-pointer'}
                    onClick={() => setPasswordVisible(currentval => !currentval)}
                    ></i>
                    :
                    ""
            }
        </div>
    )
}

export default InputBox