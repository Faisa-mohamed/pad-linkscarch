import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { SignUpForm } from './components/auth/SignUpForm';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './components/home/HomePage';
import { DonationsList } from './components/browse/DonationsList';
import { RequestsList } from './components/browse/RequestsList';
import { MyDonations } from './components/donor/MyDonations';
import { MyRequests } from './components/recipient/MyRequests';
import { EducationSection } from './components/education/EducationSection';
import { ProfilePage } from './components/profile/ProfilePage';
import { BlockchainViewer } from './components/blockchain/BlockchainViewer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SmartMatch } from './components/matching/SmartMatch';

function App() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [currentView, setCurrentView] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading PadLink...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 flex items-center justify-center p-4">
        {showLogin ? (
          <LoginForm onToggleForm={() => setShowLogin(false)} />
        ) : (
          <SignUpForm onToggleForm={() => setShowLogin(true)} />
        )}
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onNavigate={setCurrentView} />;
      case 'donations':
        return <DonationsList />;
      case 'requests':
        return <RequestsList />;
      case 'my-donations':
        return <MyDonations />;
      case 'my-requests':
        return <MyRequests />;
      case 'education':
        return <EducationSection />;
      case 'blockchain':
        return <BlockchainViewer />;
      case 'admin':
        return <AdminDashboard />;
      case 'smart-match':
        return <SmartMatch />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-rose-600 text-white px-4 py-2 rounded-lg z-50 font-semibold"
      >
        Skip to main content
      </a>
      <Navbar currentView={currentView} onNavigate={setCurrentView} />
      <main id="main-content" role="main" tabIndex={-1}>
        {renderView()}
      </main>
    </div>
  );
}

export default App;
