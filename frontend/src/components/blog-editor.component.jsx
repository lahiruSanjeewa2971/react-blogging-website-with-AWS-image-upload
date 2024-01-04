import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import logo from '../imgs/logo.png'
import defaultBanner from '../imgs/blog banner.png'
import AnimationWrapper from '../common/page-animation'
import { uploadImage } from '../common/aws'
import { Toaster, toast } from 'react-hot-toast'


function BlogEditor() {
    let blogBannerRef = useRef();

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
                        blogBannerRef.current.src = url;

                        // Stop loading toast after success image upload.
                        // show success toast.
                        toast.dismiss(loadingToast);
                        toast.success("Uploaded.")
                    }
                })
                .catch(err => {
                    toast.dismiss(loadingToast);
                    return toast.error(err);
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
                    New blog
                </p>

                <div className='flex gap-4 ml-auto'>
                    <button className='btn-dark py-2'>
                        Publish
                    </button>
                    <button className='btn-light py-2'>
                        Save Draft
                    </button>
                </div>
            </nav>
            <Toaster/>

            <AnimationWrapper>
                <section>
                    <div className='mx-auto max-w-[900px] w-full'>
                        <div className='relative aspect-video bg-white border-4 border-grey hover:opacity-80'>
                            <label htmlFor="uploadBanner">
                                <img ref={blogBannerRef} src={defaultBanner} className='z-20' />
                                <input
                                    id='uploadBanner'
                                    type='file'
                                    accept='.png, .jpg, .jpeg'
                                    hidden
                                    onChange={handleBannerUpload}
                                />
                            </label>
                        </div>
                    </div>
                </section>
            </AnimationWrapper>
        </>
    )
}

export default BlogEditor