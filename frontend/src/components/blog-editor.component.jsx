import React, { useContext, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../imgs/logo.png'
import defaultBanner from '../imgs/blog banner.png'
import AnimationWrapper from '../common/page-animation'
import { uploadImage } from '../common/aws'
import { Toaster, toast } from 'react-hot-toast'
import { EditorContext } from '../pages/editor.pages'
import EditorJS from '@editorjs/editorjs'
import { tools } from './tools.component'
import axios from 'axios'
import { UserContext } from '../App'

function BlogEditor() {
    // let blogBannerRef = useRef();

    // get access to blogStructure from EditorContex component
    let { blog, blog: { title, banner, content, tags, des }, setBlog, editoState, setEditoState, textEditor, setTextEditor } = useContext(EditorContext);

    let { userAuth: { accessToken } } = useContext(UserContext);
    let navigate = useNavigate();

    // put editor below the <hr/>
    useEffect(() => {
        if (!textEditor.isReady) {
            setTextEditor(new EditorJS({
                holderId: "textEditor",
                data: content,
                tools: tools,
                placeholder: "Let's write an awsome story."
            }))
        }
    }, [])

    const handleTitleKeyDown = (e) => {
        // prevent user from entering enter key within the blog title area.
        // How to do it.
        // onKeyDown <= by using this we can take specific key's value.
        // then prevent it from typing.
        if (e.keyCode == 13) { // key value for enter key.
            e.preventDefault();
        }
    }

    const handleTitleChange = (e) => {
        // handle height of the text area as the number of lines change.
        let input = e.target;
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';

        // set blog title
        setBlog({ ...blog, title: input.value });
    }

    // handle image uplad to S3 bucket at AWS.
    const handleBannerUpload = (e) => {
        let img = e.target.files[0];

        if (img) {
            // show loading while image is being uploded.
            let loadingToast = toast.loading("Uploading...");
            uploadImage(img)
                .then((url) => {
                    if (url) {
                        // need to access below <img /> tag to update it's src value to display upladed image.
                        // blogBannerRef.current.src = url;

                        // Stop loading toast after success image upload.
                        // show success toast.
                        toast.dismiss(loadingToast);
                        toast.success("Uploaded.");

                        // set blog banner url to global blog variable.
                        setBlog({ ...blog, banner: url })
                    }
                })
                .catch(err => {
                    toast.dismiss(loadingToast);
                    return toast.error(err);
                })
        }
    }

    // handling banner image url errors
    const handleBannerImageError = (e) => {
        let img = e.target;
        img.src = defaultBanner;
    }

    // publish button onClick
    const handlePublishEvent = () => {
        if (!banner.length) {
            return toast.error("Upload a blog banner to publish it.")
        }
        if (!title.length) {
            return toast.error("Write blog title to publish it.")
        }

        if (textEditor.isReady) {
            textEditor.save().then(data => {
                if (data.blocks.length) {
                    setBlog({ ...blog, content: data });
                    setEditoState("publish");
                }
                else {
                    return toast.error("Write something in your blog to publish it.");
                }
            })
                .catch((err) => {
                    console.log(err);
                })
        }
    }

    const handleOnSaveDraft = (e) => {
        // prevent multiple data submission
        if (e.target.className.includes("disable")) {
            return;
        }


        if (!title.length) {
            return toast.error("Write blog title before saving as draft.");
        }

        let loadingToast = toast.loading("Saving as draft...")

        e.target.classList.add("disable");

        if (textEditor.isReady) {
            textEditor.save().then(content => {
                let blogObj = {
                    title, banner, des, content, tags, draft: true
                }

                axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", blogObj, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                })
                    .then(() => {
                        e.target.classList.remove("disable");
                        toast.dismiss(loadingToast);
                        toast.success("Saved :)");

                        setTimeout(() => {
                            navigate("/")
                        }, 500)
                    })
                    .catch(({ response }) => {
                        e.target.classList.remove("disable");
                        toast.dismiss(loadingToast);

                        return toast.error(response.data.error);
                    })
            })
        }
    }

    return (
        <>
            <nav className='navbar'>
                <Link to='/' className='flex-none w-10'>
                    <img src={logo} />
                </Link>

                <p className='max-md:hidden text-black line-clamp-1 w-full'>
                    {title.length ? title : 'New blog'}
                </p>

                <div className='flex gap-4 ml-auto'>
                    <button className='btn-dark py-2' onClick={handlePublishEvent}>
                        Publish
                    </button>
                    <button className='btn-light py-2' onClick={handleOnSaveDraft}>
                        Save Draft
                    </button>
                </div>
            </nav>
            <Toaster />

            <AnimationWrapper>
                <section>
                    <div className='mx-auto max-w-[900px] w-full'>
                        <div className='relative aspect-video bg-white border-4 border-grey hover:opacity-80'>
                            <label htmlFor="uploadBanner">
                                <img
                                    // ref={blogBannerRef} 
                                    src={banner}
                                    className='z-20'
                                    onError={handleBannerImageError}
                                />
                                <input
                                    id='uploadBanner'
                                    type='file'
                                    accept='.png, .jpg, .jpeg'
                                    hidden
                                    onChange={handleBannerUpload}
                                />
                            </label>
                        </div>

                        <textarea
                            defaultValue={title}
                            placeholder='Blog Title'
                            className='text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40'
                            onKeyDown={handleTitleKeyDown}
                            onChange={handleTitleChange}
                        ></textarea>

                        <hr className='w-full opacity-10 my-5' />

                        <div id='textEditor' className='font-gelasio'></div>
                    </div>
                </section>
            </AnimationWrapper>
        </>
    )
}

export default BlogEditor