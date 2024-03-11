import React, { useContext } from 'react'
import { EditorContext } from '../pages/editor.pages'

function Tag({ tag, tagIndex }) {
    let { blog, blog: { tags }, setBlog } = useContext(EditorContext);

    const handleTagDelete = () => {
        // have a array [1,2,3]
        // if accessing element 2 to remove it from above array
        // [1,2,3] (1 != 2), (2 == 2), (3 != 2) => [1,3]  (form new array)
        tags = tags.filter(t => t != tag);
        setBlog({ ...blog, tags })
    }

    // edit tag after adding to the array
    const handleTagEdit = (e) => {
        if (e.keyCode == 13 || e.keyCode == 188) {
            e.preventDefault();
            let currentTag = e.target.innerText;
            tags[tagIndex] = currentTag;
            setBlog({ ...blog, tags });
            console.log(tags)
            e.target.setAttribute("contentEditable", false);
        }
    }

    const handleContentEditable = (e) => {
        e.target.setAttribute("contentEditable", true);
        e.target.focus();
    }

    return (
        <div
            className='relative p-2 mt-2 mr-2 px-5 bg-white rounded-full inline-block hover:bg-opacity-50 pr-10'
        >
            <p className='outline-none' onKeyDown={handleTagEdit} onClick={handleContentEditable}>{tag}</p>

            <button
                className='absolute mt-[2px] rounded-full right-3 top-1/2 -translate-y-1/2'
                onClick={handleTagDelete}
            >
                <i className='fi fi-br-cross text-sm pointer-events-none'></i>
            </button>
        </div>
    )
}

export default Tag