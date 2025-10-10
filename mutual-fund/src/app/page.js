// app/page.js
import Link from 'next/link';
import Navbar from '../components/Navbar.js';
import { FaCalculator, FaBalanceScale,FaRocket, FaLightbulb, FaLock } from 'react-icons/fa';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* 1. Hero Section - High Impact Design */}
      <header className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
        
        {/* Abstract Background Effect (Subtle Glow) */}
        <div className="absolute inset-0 z-0 opacity-10">
            <div className="h-full w-full bg-gradient-to-br from-gray-950 via-gray-900 to-sky-900" />
            <div className="absolute top-1/4 left-1/4 h-64 w-64 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" />
            <div className="absolute bottom-0 right-1/4 h-72 w-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow delay-1000" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Analyze. Predict. <span className="text-sky-400">Invest Smarter.</span>
          </h1>
          
          <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-400">
            Unlock the power of **historical NAV data** with cutting-edge analytics, the **AI Goal Planner**, and instant return calculators. Built for the modern investor.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/funds" className="px-8 py-3 text-lg font-bold text-white bg-sky-600 rounded-xl shadow-lg shadow-sky-600/50 hover:bg-sky-700 transition duration-300 transform hover:scale-105">
              Explore All Schemes
            </Link>
            <Link href="/scheme/100033" className="px-8 py-3 text-lg font-bold text-sky-400 border-2 border-sky-400 rounded-xl hover:bg-sky-400 hover:text-gray-950 transition duration-300 transform hover:scale-105">
              Try AI Demo
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Feature Grid Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Why MFAnalytics?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature Card 1: Goal Planner */}
            <FeatureCard 
              icon={FaRocket} 
              title="Goal-Based Planner" 
              description="Our unique calculator tells you the exact monthly SIP needed to hit your future financial targets." 
              accentColor="text-green-400"
            />
            {/* Feature Card 2: AI Insights */}
            <FeatureCard 
              icon={FaLightbulb} 
              title="AI Investment Insights" 
              description="Get Gemini-powered, concise summaries on scheme performance, risk, and category analysis, removing the jargon." 
              accentColor="text-purple-400"
            />
            {/* Feature Card 3: Comparison */}
            <FeatureCard 
              icon={FaBalanceScale} 
              title="Fund Battle Mode" 
              description="Compare up to three schemes side-by-side with synchronized charts and a quick-reference metric table." 
              accentColor="text-amber-400"
            />
            {/* Feature Card 4: Security/Tech */}
            <FeatureCard 
              icon={FaLock} 
              title="Built with Next.js" 
              description="Lightning-fast performance powered by Next.js API Routes and advanced caching ensures speed and reliability." 
              accentColor="text-sky-400"
            />
          </div>
        </div>
      </section>

      {/* 3. Footer */}
      <footer className="py-8 border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} MFAnalytics. Built for the Hackathon by a fellow developer.</p>
        </div>
      </footer>
    </div>
  );
}

// Reusable Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, accentColor }) => (
  <div className="p-6 bg-gray-800 rounded-xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 border-t-4 border-sky-500/0 hover:border-sky-500">
    <Icon className={`text-4xl ${accentColor} mb-4`} />
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-gray-400 text-sm">{description}</p>
  </div>
);