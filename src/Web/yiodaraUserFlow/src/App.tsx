import { Routes, Route } from 'react-router-dom'
import RootLayout from './components/layout/Rootlayout'
import AuthLayout from './components/layout/AuthLayout'
import Login from './pages/auth/Login'
import SignUp from './pages/auth/SignUp'
import ProtectedRoute from './components/auth/ProtectedRoute'

import Landing from './pages/Landing'
import AboutUs from './pages/AboutUs'
import MakeDonation from './pages/campaigns/MakeDonation'
import DonationHistory from './pages/user/DonationHistory'
import MyAccount from './pages/user/MyAccount'
import StarContributors from './pages/StarContributors'
import PartnerWithUs from './pages/PartnerWithUs'
import Campaign from './pages/campaigns/Campaign'
import CampaignDetails from './pages/campaigns/CampaignDetails'
import Voulnteers from './pages/Voulnteers'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import AllCategories from './pages/Categories'
import EventsPage from './pages/events/Events'

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Landing />} />
        <Route path="about" element={<AboutUs />} />
        <Route path="campaigns" element={<Campaign />} />
        <Route path="categories" element={<AllCategories />} />
        <Route path="campaign/:id" element={<CampaignDetails />} />
        <Route path="volunteers" element={<Voulnteers />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="donate" element={<MakeDonation />} />
        <Route path="contributors" element={<StarContributors />} />
        <Route path="partner" element={<PartnerWithUs />} />
        
        {/* Protected routes */}
        <Route path="history" element={
          <ProtectedRoute>
            <DonationHistory />
          </ProtectedRoute>
        } />
        <Route path="account" element={
          <ProtectedRoute>
            <MyAccount />
          </ProtectedRoute>
        } />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
      </Route>
    </Routes>
  )
}

export default App