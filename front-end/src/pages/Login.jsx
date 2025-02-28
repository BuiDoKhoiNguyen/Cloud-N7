import { useEffect, useRef } from "react";
import { LoginForm } from "../features/account";

export default function Login() {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      ref.current.classList.remove("-translate-y-[1000px]");
      ref.current.classList.add("-translate-y-1/2");
    }
  }, []);

  return (
    <div className=" relative w-screen h-screen bg-background">
      <div
        ref={ref}
        className="absolute top-1/2 transition-[transform] -translate-y-[1000px] duration-500 left-1/2 -translate-x-1/2 p-10 shadow-md  max-h-[90%] overflow-y-auto w-[95%] max-w-[500px] bg-surface text-onSurface"
      >
        <LoginForm />
      </div>
    </div>
  );
}
