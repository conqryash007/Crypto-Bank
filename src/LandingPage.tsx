import React from 'react';
import { Shield, Zap, TrendingUp } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-gold-500 selection:text-slate-900">


      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10" />
        
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Stake your Stablecoins, <br />
            <span className="text-gold-400">Earn High Yield</span>
          </h1>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            The most secure and efficient way to grow your crypto assets. 
            Join thousands of users earning passive income with CryptoBank.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gold-500 hover:bg-gold-400 text-slate-900 px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-xl shadow-gold-500/20">
              Start Staking Now
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all border border-slate-700">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-gold-400" />}
              title="Bank-Grade Security"
              description="Your assets are protected by industry-leading security protocols and audited smart contracts."
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-gold-400" />}
              title="Lightning Fast"
              description="Experience instant deposits and withdrawals with our optimized high-performance infrastructure."
            />
            <FeatureCard 
              icon={<TrendingUp className="w-8 h-8 text-gold-400" />}
              title="High APY"
              description="Maximize your returns with our competitive interest rates and auto-compounding yields."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-gold-500/30 transition-all hover:-translate-y-1 group">
    <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-slate-800/80 transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-4 text-white">{title}</h3>
    <p className="text-slate-400 leading-relaxed">
      {description}
    </p>
  </div>
);

export default LandingPage;
