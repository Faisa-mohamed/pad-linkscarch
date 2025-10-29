import { useAuth } from '../../contexts/AuthContext';
import { Heart, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function Navbar({ currentView, onNavigate }: NavbarProps) {
  const { profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', show: true },
    { id: 'donations', label: 'Donations', show: true },
    { id: 'requests', label: 'Requests', show: true },
    { id: 'blockchain', label: 'Blockchain', show: true },
    { id: 'education', label: 'Learn', show: true },
    { id: 'admin', label: 'Admin', show: profile?.user_type === 'admin' },
    { id: 'my-donations', label: 'My Donations', show: profile?.user_type === 'donor' },
    { id: 'my-requests', label: 'My Requests', show: profile?.user_type === 'recipient' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <Heart className="w-8 h-8 text-rose-600 fill-rose-600" />
            <span className="text-2xl font-bold text-gray-800">PadLink</span>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.filter(item => item.show).map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  currentView === item.id
                    ? 'bg-rose-100 text-rose-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">{profile?.full_name}</span>
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 py-4 space-y-2">
            {navItems.filter(item => item.show).map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition ${
                  currentView === item.id
                    ? 'bg-rose-100 text-rose-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                onNavigate('profile');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span className="font-medium">{profile?.full_name}</span>
              </div>
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
