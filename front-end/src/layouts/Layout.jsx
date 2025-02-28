import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SocketProvider } from "../hooks/socket";
import { UserProvider } from "../hooks/user";
import CommonContext from "../store/CommonContext";
import Header from "./Header";
import { ConfigProvider, theme } from "antd";

export default function () {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkmode") === "true"
  );
  const ref = useRef();
  const { darkAlgorithm, defaultAlgorithm } = theme;

  useEffect(() => {
    let last = 0;
    const listener = () => {
      ref.current.style.top = window.scrollY < last ? "0px" : "-100%";
      ref.current.style.transitionDelay =
        window.scrollY < last ? "500ms" : "0ms";
      last = window.scrollY;
    };
    window.addEventListener("scroll", listener);
    return () => window.removeEventListener("scroll", listener);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("darkmode", darkMode);
  }, [darkMode]);



  return (
    <CommonContext.Provider value={{ darkMode, setDarkMode, headerRef: ref }}>
      <ConfigProvider theme={{ algorithm: darkMode ? darkAlgorithm : defaultAlgorithm }}>
        <SocketProvider>
          <UserProvider>
            <div className={`bg-background text-onBackground min-h-screen`}>
              <div
                ref={ref}
                className={`sticky z-20 transition-all duration-500`}
              >
                <Header />
              </div>
              <Outlet />
            </div>
          </UserProvider>
        </SocketProvider>
      </ConfigProvider>
      <ToastContainer />
    </CommonContext.Provider>
  );
}
