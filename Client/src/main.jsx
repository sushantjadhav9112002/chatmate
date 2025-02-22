import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Homepage from "./routes/Homepages/homepage";
import DashBoardPage from "./routes/dashboardpages/dashBoardpage";
import ChatPage from "./routes/chatPage/chatPage";
import RootLayout from './layOuts/rootlayOuts/rootLayout'; // Capitalized import name
import Dashboardlayout from './layOuts/rootlayOuts/dashboardLayouts/dashboardlayout';
import SigninPage from './routes/signInPage/signinPage';
import Signuppage from './routes/signUpPage/signUppage';

// Import your publishable key



const router = createBrowserRouter([ // Use lowercase 'router' consistently
  {
    element: <RootLayout />, // Corrected component name capitalization
    children: [
      {
        path: "/",
        element: <Homepage />
      },
      {
        path: "/sign-in/*",
        element: <SigninPage />
      },
      {
        path: "/sign-up/*",
        element: <Signuppage />
      },
      {
        element : <Dashboardlayout />,
        children: [
          {
          path: "/dashboard",
          element: <DashBoardPage />,
          },
          {
            path: "/dashboard/chats/:id",
            element: <ChatPage />,
          },
        ],
        
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} /> {/* Corrected to use lowercase 'router' */}
  </React.StrictMode>,
);
