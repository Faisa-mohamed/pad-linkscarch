import { Heart, Package, HandHeart, BookOpen, Users, Shield } from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const features = [
    {
      icon: Package,
      title: 'Donate Pads',
      description: 'Share unused menstrual pads with those in need',
      color: 'rose',
      action: () => onNavigate('my-donations'),
    },
    {
      icon: HandHeart,
      title: 'Request Help',
      description: 'Get access to free menstrual products',
      color: 'pink',
      action: () => onNavigate('my-requests'),
    },
    {
      icon: BookOpen,
      title: 'Learn & Grow',
      description: 'Access period health education and resources',
      color: 'red',
      action: () => onNavigate('education'),
    },
  ];

  const stats = [
    { icon: Users, value: '1000+', label: 'Community Members' },
    { icon: Package, value: '5000+', label: 'Pads Donated' },
    { icon: Heart, value: '800+', label: 'Lives Impacted' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Heart className="w-20 h-20 text-rose-600 fill-rose-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Welcome to <span className="text-rose-600">PadLink</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Connecting generous donors with people in need of menstrual products.
            Together, we're breaking barriers and promoting period health awareness.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const bgColorClass = feature.color === 'rose' ? 'bg-rose-100' : feature.color === 'pink' ? 'bg-pink-100' : 'bg-red-100';
            const textColorClass = feature.color === 'rose' ? 'text-rose-600' : feature.color === 'pink' ? 'text-pink-600' : 'text-red-600';
            const hoverColorClass = feature.color === 'rose' ? 'hover:text-rose-700' : feature.color === 'pink' ? 'hover:text-pink-700' : 'hover:text-red-700';

            return (
              <div
                key={feature.title}
                onClick={feature.action}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 cursor-pointer transform hover:-translate-y-2"
              >
                <div className={`${bgColorClass} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className={`w-8 h-8 ${textColorClass}`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                <button className={`mt-6 ${textColorClass} font-semibold ${hoverColorClass} transition`}>
                  Learn More →
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-12 mb-16">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-rose-100 p-4 rounded-full">
                    <stat.icon className="w-8 h-8 text-rose-600" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-800 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-12 mb-16">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-12 h-12 text-rose-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
            Blockchain-Powered Transparency
          </h2>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-8">
            Every donation on PadLink is recorded on an immutable blockchain ledger, ensuring complete
            transparency and accountability. Track your donations, verify the chain integrity, and see
            the real impact of your contributions.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-rose-50 rounded-xl">
              <div className="text-2xl font-bold text-rose-600 mb-2">Transparent</div>
              <p className="text-gray-600 text-sm">All transactions are publicly viewable and verifiable</p>
            </div>
            <div className="text-center p-6 bg-rose-50 rounded-xl">
              <div className="text-2xl font-bold text-rose-600 mb-2">Immutable</div>
              <p className="text-gray-600 text-sm">Records cannot be altered or deleted once added</p>
            </div>
            <div className="text-center p-6 bg-rose-50 rounded-xl">
              <div className="text-2xl font-bold text-rose-600 mb-2">Trustworthy</div>
              <p className="text-gray-600 text-sm">Cryptographic proof ensures data integrity</p>
            </div>
          </div>
          <div className="text-center">
            <button
              onClick={() => onNavigate('blockchain')}
              className="bg-rose-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-rose-700 transition inline-flex items-center space-x-2"
            >
              <Shield className="w-5 h-5" />
              <span>View Blockchain Ledger</span>
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-3xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Every donation makes a difference. Whether you're a donor or recipient,
            you're part of a community working to end period poverty.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => onNavigate('donations')}
              className="bg-white text-rose-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
            >
              Browse Donations
            </button>
            <button
              onClick={() => onNavigate('requests')}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-rose-600 transition"
            >
              View Requests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
