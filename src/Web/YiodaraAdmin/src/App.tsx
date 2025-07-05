import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import Donors from './pages/Donors';
import Volunteers from './pages/Volunteers';
import Partnerships from './pages/Partnerships';
import Layout from './components/Layout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CampaignCategories from './pages/CampaignCategories';
import CreateCampaign from "@/components/campaigns/CreateCampaign";
import EditCampaign from './pages/EditCampaign';
import Events from './pages/Events';
import CreateEvent from './components/events/CreateEvent';
import Account from './pages/Account';
import Notifications from './pages/Notifications';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/donors" element={<Donors />} />
                <Route path="/volunteers" element={<Volunteers />} />
                <Route path="/partnerships" element={<Partnerships />} />
                <Route path="/campaign-categories" element={<CampaignCategories />} />
                <Route path="/create-campaign" element={<CreateCampaign />} />
                <Route path="/campaigns/edit/:id" element={<EditCampaign />} />
                <Route path="/events" element={<Events />} />
                <Route path="/create-event" element={<CreateEvent />} />
                <Route path="/account" element={<Account />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>
            </Route>
            
            {/* Redirect to login for any other routes */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;