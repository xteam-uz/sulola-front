import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios-client";

export const Login = () => {
    const emailRef = useRef();
    const passwordRef = useRef();

    const [errors, setErrors] = useState(null);
    const { setUser, setToken } = useStateContext();

    const onSubmit = (event) => {
        event.preventDefault();
        const payload = {
            email: emailRef.current.value,
            password: passwordRef.current.value,
        };
        setErrors(null);
        axiosClient
            .post("/login", payload)
            .then(({ data }) => {
                setUser(data.user);
                setToken(data.token);
            })
            .catch((error) => {
                const response = error.response;
                if (response && response.status === 422) {
                    if (response.data.errors) {
                        setErrors(response.data.errors);
                    } else {
                        setErrors({
                            email: [response.data.message],
                            password: [response.data.message],
                        });
                    }
                }
            });
    };

    return (
        <form onSubmit={onSubmit}>
            <h1 className="title">Login into your account</h1>
            {errors && (
                <div className="alert">
                    {Object.keys(errors).map((key) => (
                        <p key={key}>{errors[key][0]}</p>
                    ))}
                </div>
            )}

            <input ref={emailRef} type="email" placeholder="Email" />
            <input ref={passwordRef} type="password" placeholder="Password" />

            <button type="submit" className="btn btn-block">
                Login
            </button>

            <p className="message">
                Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
        </form>
    );
};
