import React, { createContext, useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../App';
import BlogEditor from '../components/blog-editor.component';
import PublishForm from '../components/publish-form.component';

// global variable for store newly creating blog values.
// make it as context.
// so it can be access BlogEditor and also PublishForm components.
const blogStructure = {
    title: '',
    banner: '',
    content: [],
    tags: [],
    des: '',
    author: { personal_info: {} }
}
export const EditorContext = createContext({});

function EditorPage() {
    const { userAuth: { accessToken } } = useContext(UserContext);

    const [editoState, setEditoState] = useState('editor');
    const [textEditor, setTextEditor] = useState({ isReady: false })
    const [blog, setBlog] = useState(blogStructure);

    return (
        <EditorContext.Provider value={{ blog, setBlog, editoState, setEditoState, textEditor, setTextEditor }}>
            {
                accessToken === null ? <Navigate to='/signin' />
                    :
                    editoState == 'editor' ?
                        <BlogEditor />
                        :
                        <PublishForm />
            }
        </EditorContext.Provider>
    )
}

export default EditorPage