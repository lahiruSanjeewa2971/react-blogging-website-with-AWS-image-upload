import React, { useEffect, useState } from 'react'
import AnimationWrapper from '../common/page-animation'
import InPageNavigation, { activeTabLineRef, activeTabRef } from '../components/inpage-navigation.component'
import axios from 'axios';
import Loader from '../components/loader.component';
import BlogPostCard from '../components/blog-post.component';
import MinimalBlogPost from '../components/nobanner-blog-post.component';
import NoDataMessage from '../components/nodata.component';

function HomePage() {
    const [blogs, setBlogs] = useState(null);
    const [trendingBlogs, setTrendingBlogs] = useState(null);
    const [pageState, setPageState] = useState("home")

    let categories = ["anime", "animal", "vehicles", "hero", "car", "getsuga tensho", "yuji", "gear 2"];

    useEffect(() => {
        // virtually or
        // manually set button click state using ref();
        // access that button using useRef(), then do the below
        activeTabRef.current.click();

        if (pageState == 'home') {
            fetchLatestBlogs();
        }
        else {
            fetchBlogsByCategory()
        }

        if (!trendingBlogs) {
            fetchTrendingBlogs();
        }

    }, [pageState])

    // without pagination | fetching blogs
    // const fetchLatestBlogs = () => {
    //     axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs")
    //         .then((data) => {
    //             // console.log(data.data.blogs);
    //             setBlogs(data.data.blogs);
    //         })
    //         .catch(err => {
    //             console.log("___error :", err)
    //         })
    // }


    // with pagination | fetching blogs
    const fetchLatestBlogs = (page = 1) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", { page })
            .then((data) => {
                console.log(data.data);
                // setBlogs(data.data.blogs);
            })
            .catch(err => {
                console.log("___error :", err)
            })
    }

    const fetchTrendingBlogs = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
            .then((data) => {
                // console.log(data.data.blogs);
                setTrendingBlogs(data.data.blogs);
            })
            .catch(err => {
                console.log("___error :", err)
            })
    }

    const loadBlogByCategory = (e) => {
        // this is how we take clicked button's text.
        let category = e.target.innerText.toLowerCase();

        setBlogs(null);

        if (pageState == category) {
            setPageState("home");
            return;
        }

        setPageState(category);
    }

    const fetchBlogsByCategory = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { tag: pageState })
            .then((data) => {
                // console.log(data.data.blogs);
                setBlogs(data.data.blogs);
            })
            .catch(err => {
                console.log("___error :", err)
            })
    }

    return (
        <AnimationWrapper>
            <section className='h-cover flex justify-center gap-10'>
                {/* Latest blogs */}
                <div
                    className='w-full'
                >
                    <InPageNavigation
                        routes={[pageState, "trending-blogs"]}
                        defaultHidden={["trending-blogs"]}
                    >
                        <>
                            {
                                blogs == null ? (<Loader />)
                                    :
                                    (blogs.length ?
                                        blogs.map((blog, i) => {
                                            return <AnimationWrapper transition={{ duration: 1, delay: i * .1 }}>
                                                <BlogPostCard content={blog} author={blog.author?.personal_info} />
                                                {/* <h1>{blog.author.personal_info}</h1> */}
                                            </AnimationWrapper>
                                        })
                                        :
                                        <NoDataMessage message="No blogs published yet..." />
                                    )
                            }
                        </>

                        {
                            trendingBlogs == null ? (<Loader />)
                                :
                                (trendingBlogs.length ?
                                    trendingBlogs.map((blog, i) => {
                                        return <AnimationWrapper transition={{ duration: 1, delay: i * .1 }}>
                                            <MinimalBlogPost blog={blog} index={i} />
                                        </AnimationWrapper>
                                    })
                                    :
                                    <NoDataMessage message="No trending blogs..." />
                                )
                        }
                    </InPageNavigation>
                </div>

                {/* Filters & trending blogs */}
                <div className='min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden'>
                    <div className='flex flex-col gap-10'>
                        <div>
                            <h1 className='font-medium text-xl mb-8'>Stories from all interests.</h1>

                            {/*  */}
                            <div className='flex gap-3 flex-wrap'>
                                {
                                    categories.map((cateogry, i) => {
                                        return <button className={'tag ' + (pageState == cateogry ? " bg-black text-white" : "")}
                                            onClick={loadBlogByCategory}
                                            key={i}
                                        >
                                            {cateogry}
                                        </button>
                                    })
                                }
                            </div>
                        </div>


                        <div>
                            <h1 className='font-medium text-xl mb-8'>
                                Trending <i className='fi fi-rr-arrow-trend-up'></i>
                            </h1>

                            {
                                trendingBlogs == null ? (<Loader />)
                                    :
                                    (
                                        trendingBlogs.length ?
                                            trendingBlogs.map((blog, i) => {
                                                return <AnimationWrapper transition={{ duration: 1, delay: i * .1 }}>
                                                    <MinimalBlogPost blog={blog} index={i} />
                                                </AnimationWrapper>
                                            })
                                            :
                                            <NoDataMessage message="No trending blogs..." />
                                    )
                            }
                        </div>
                    </div>
                </div>
            </section>
        </AnimationWrapper>
    )
}

export default HomePage