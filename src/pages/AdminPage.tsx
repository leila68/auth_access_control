import { useNavigate, Outlet, useLocation } from "react-router-dom";
import React from "react";
import { Button } from "../components/ui/button";

const AdminPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract active tab from the current path (like "events" from "/admin/events")
  const activeTab = location.pathname.split("/").pop();

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600 mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b pb-2">
        {["events", "users", "settings"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => navigate(`/admin/${tab}`)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content rendered here */}
      <Outlet />

      {/* Back button */}
      <div className="fixed bottom-6 left-6">
        <Button onClick={() => navigate("/auth")}>Back to Login</Button>
      </div>
    </div>
  );
};

export default AdminPage;
