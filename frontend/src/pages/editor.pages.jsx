import React, { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../App';
import BlogEditor from '../components/blog-editor.component';
import PublishForm from '../components/publish-form.component';

function EditorPage() {
    const { userAuth: { accessToken } } = useContext(UserContext);

    const [editoState, setEditoState] = useState('editor');

    return (
        accessToken === null ? <Navigate to='/signin' />
        :
        editoState == 'editor' ? 
        <BlogEditor/> 
        : 
        <PublishForm/>
    )
}

export default EditorPage