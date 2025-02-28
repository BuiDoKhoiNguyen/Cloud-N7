import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { GroupsLayout } from "./features/group";
import "./index.css";
import Layout from "./layouts/Layout";
import Account from "./pages/Account";
import CaroGame from "./pages/CaroGame";
import CaroGames from "./pages/CaroGames";
import File from "./pages/File";
import Friends from "./pages/Friends";
import Group from "./pages/Group";
import Groups from "./pages/Groups";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Messenger from "./pages/Messenger";
import Note from "./pages/NotePage";
import Post from "./pages/Post";
import Register from "./pages/Register";
import Story from "./pages/Story";
import Events from "./pages/Events";
import Event from "./pages/Event";

const router = createBrowserRouter([
  {
    path: "",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "stories",
        element: <Story />,
      },
      {
        path: "users/:id",
        element: <Account />,
      },
      {
        path: "posts/:id",
        element: <Post />,
      },
      {
        path: "files/:id",
        element: <File />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "friends",
        element: <Friends />,
      },
      {
        path: "events",
        element: <Events />,
      },
      {
        path: "events/:id",
        element: <Event />,
      },
      {
        path: "messages",
        element: <Messenger />,
      },
      {
        path: "carogames",
        element: <CaroGames />,
      },
      {
        path: "carogames/:id",
        element: <CaroGame />,
      },
      {
        path: "groups",
        element: <GroupsLayout />,
        children: [
          {
            path: "",
            element: <Groups />,
          },
          {
            path: ":id",
            element: <Group />,
          },
        ],
      },
      {
        path: "somestuffs/note",
        element: <Note />,
      },
    ],
  },
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}></RouterProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
