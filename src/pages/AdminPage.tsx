import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { Button } from "../components/ui/button";
import Events from "../pages/events";

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("events");

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600 mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b pb-2">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "events" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("events")}
        >
          Events
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "users" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "analytics" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "settings" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "events" && <Events />}
      {activeTab === "users" && <div className="text-gray-500">Users management coming soon...</div>}
      {activeTab === "analytics" && <div className="text-gray-500">Analytics dashboard coming soon...</div>}
      {activeTab === "settings" && <div className="text-gray-500">Settings panel coming soon...</div>}

      {/* Back button */}
      <div className="fixed bottom-6 left-6">
        <Button onClick={() => navigate("/auth")}>Back to Login</Button>
      </div>
    </div>
  );
};

export default AdminPage;
