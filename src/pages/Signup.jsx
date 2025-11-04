import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";

export const Signup = () => {
    const nameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmationRef = useRef();

    const [errors, setErrors] = useState(null);
    const { setUser, setToken } = useStateContext();

    const onSubmit = (event) => {
        event.preventDefault();
        const payload = {
            name: nameRef.current.value,
            email: emailRef.current.value,
            password: passwordRef.current.value,
            password_confirmation: passwordConfirmationRef.current.value,
        };
        axiosClient
            .post("/signup", payload)
            .then(({ data }) => {
                setUser(data.user);
                setToken(data.token);
            })
            .catch((error) => {
                const response = error.response;
                if (response && response.status === 422) {
                    console.log(response.data.errors);
                    setErrors(response.data.errors);
                }
            });
    };

    return (
        <form onSubmit={onSubmit}>
            <h1 className="title">Sign up for free</h1>
            {errors && (
                <div className="alert">
                    {Object.keys(errors).map((key) => (
                        <p key={key}>{errors[key][0]}</p>
                    ))}
                </div>
            )}
            <input ref={nameRef} type="text" placeholder="Full Name" />
            <input ref={emailRef} type="email" placeholder="Email" />
            <input ref={passwordRef} type="password" placeholder="Password" />
            <input
                ref={passwordConfirmationRef}
                type="password"
                placeholder="Password Confirmation"
            />

            <button type="submit" className="btn btn-block">
                Logn up
            </button>

            <p className="message">
                Already registered? <Link to="/login">Sign in</Link>
            </p>
        </form>
    );
};
