import axios from 'axios'
import React, { useContext } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { Link, Navigate } from 'react-router-dom'
import { UserContext } from '../App'
import AnimationWrapper from '../common/page-animation'
import { storeInSession } from '../common/session'
import InputBox from '../components/input.component'
import googleIcon from '../imgs/google.png'
// import { authWithGoogle } from '../common/firebase'
// import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth'
// import { app } from '../common/firebase'

function UserAuthForm({ type }) {
    // const authForm = useRef();
    let { userAuth: { accessToken }, setUserAuth } = useContext(UserContext);
    // const firebaseAuth = getAuth(app);
    // const provider = new GoogleAuthProvider();

    const userAuthThroughServer = (serverRoute, formData) => {
        // console.log(serverRoute)
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
            .then(({ data }) => {
                storeInSession('user', JSON.stringify(data));
                setUserAuth(data)
            })
            .catch(({ response }) => {
                toast.error(response.data.error);
            })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        let form = new FormData(loginSignUpForm);
        let formData = {};
        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
        let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

        let serverRoute = type == "sign-in" ? "/signin" : "/signup";

        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }
        // console.log(formData)
        let { fullname, email, password } = formData;

        if (fullname) {
            if (fullname.length < 3) {
                return toast.error("Full name at least 3 character long.");
            }
        }
        if (!email.length) {
            return toast.error("Please enter an email.");
        }
        if (!emailRegex.test(email)) {
            return toast.error("Please enter a valid email.");
        }
        if (!passwordRegex.test(password)) {
            return toast.error("Password should be 6 - 20 characters long with a numeric, 1 lowercase, and 1 uppercase.");
        }

        userAuthThroughServer(serverRoute, formData);
    }

    // const handleGoogleAuth = async (e) => {
    //     // console.log("1")
    //     let user = null;
    //     e.preventDefault();

    //     await signInWithPopup(firebaseAuth, provider)
    //         .then((result) => {
    //             user = result.user;
    //             let serverRoute = "/google-auth";
    //             let formData = {
    //                 accessToken: user.accessToken
    //             }

    //             userAuthThroughServer(serverRoute, formData)
    //         })
    //         .catch(err => {
    //             toast.error('Trouble login with Google');
    //             return console.log('Trouble login with Google', err);
    //         })


    //     // authWithGoogle().then(user => {
    //     //     console.log(user);
    //     // })
    //     // .catch(err => {
    //     //     toast.error('Trouble login with Google');
    //     //     return console.log('Trouble login with Google', err);
    //     // })
    // }

    return (
        accessToken ?
            <Navigate to='/' />
            :
            // AnimationWrapper contain all the animations need to load a page.
            <AnimationWrapper keyValue={type}>
                {/*  h-cover is custom className in index.css */}
                <section className='h-cover flex items-center justify-center'>
                    <Toaster />
                    <form
                        // use this 'id' to select and access this form and it's elements to take values for sign-in and sign-up functions.
                        id='loginSignUpForm'
                        // ref={authForm} 
                        className='w-[80%] max-w-[400px]'
                    >
                        <h1 className='text-4xl font-gelasio capitalize text-center mb-24'>
                            {
                                type == 'sign-in' ?
                                    "Welcome back" : "Join us today"
                            }
                        </h1>

                        {
                            type != 'sign-in' ?
                                // custom input box
                                <InputBox
                                    name="fullname"
                                    type="text"
                                    placeholder="Full Name"
                                    icon="fi-rr-user"
                                />
                                :
                                ""
                        }

                        <InputBox
                            name="email"
                            type="email"
                            placeholder="Email"
                            icon="fi-rr-envelope"
                        />
                        <InputBox
                            name="password"
                            type="password"
                            placeholder="Password"
                            icon="fi-rr-key"
                        />

                        <button className='btn-dark center mt-14' type='submit' onClick={handleSubmit}>
                            {
                                type.replace("-", " ")
                            }
                        </button>

                        <div className='relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black border-black'>
                            <hr className='w-1/2 border-black' />
                            <p>OR</p>
                            <hr className='w-1/2 border-black' />
                        </div>

                        <button className='btn-dark flex items-center justify-center gap-4 w-[90%] center'
                            // onClick={handleGoogleAuth}
                        >
                            <img src={googleIcon} className='w-5' />
                            Continue with Google
                        </button>

                        {
                            type == 'sign-in' ?
                                <p className='mt-6 text-dark-grey text-xl text-center'>
                                    Don't have an account ?
                                    <Link to='/signup' className='underline text-black text-xl ml-1'>
                                        Join us Today.
                                    </Link>
                                </p>
                                :
                                <p className='mt-6 text-dark-grey text-xl text-center'>
                                    Already a member ?
                                    <Link to='/signin' className='underline text-black text-xl ml-1'>
                                        Sign in here
                                    </Link>
                                </p>
                        }
                    </form>
                </section>
            </AnimationWrapper>
    )
}

export default UserAuthForm