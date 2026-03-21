import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Factory, ArrowRight, ShieldCheck, Banknote } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Sprout className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500">
                Farm2Factory
              </span>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <span className="text-gray-600 hover:text-green-600 font-medium cursor-pointer transition">Home</span>
              <span className="text-gray-600 hover:text-green-600 font-medium cursor-pointer transition">For Farmers</span>
              <span className="text-gray-600 hover:text-green-600 font-medium cursor-pointer transition">For Factories</span>
            </div>

            <div className="flex space-x-4">
              <Link to="/login" className="text-green-600 border border-green-600 hover:bg-green-50 px-4 py-2 rounded-lg font-medium transition duration-150">
                Login
              </Link>
              <Link to="/register" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition duration-150 shadow-md">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-green-50 via-white to-emerald-50 py-20 lg:py-32 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                Direct Sugarcane Trade, <br />
                <span className="text-green-600">Zero Middlemen</span>
              </h1>
              <p className="mt-4 text-xl text-slate-600 mb-10 leading-relaxed">
                Empowering farmers with fair prices and providing factories with an assured, steady supply. 
                Transparent, automated, and secure digital trade for the sugarcane industry.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link to="/farmer-dashboard" className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <span>Explore as Farmer</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/factory-dashboard" className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <span>Explore as Factory</span>
                  <Factory className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
             <div className="absolute top-1/4 -left-20 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
             <div className="absolute top-1/3 -right-20 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
             <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>
        </section>

        {/* Features / How It Works */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How Farm2Factory Works</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">A streamlined, transparent three-step process to connect yield directly with demand.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              {/* Feature 1 */}
              <div className="bg-slate-50 rounded-2xl p-8 hover:shadow-xl transition duration-300 border border-slate-100 flex flex-col items-center text-center">
                <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-6">
                  <Factory className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">1. Factory Posts Demand</h3>
                <p className="text-slate-600">
                  Sugar factories broadcast their sugarcane requirements, including tonnage needed, offering price per ton, and timeline, directly to verified farmers.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-50 rounded-2xl p-8 hover:shadow-xl transition duration-300 border border-slate-100 flex flex-col items-center text-center relative">
                <div className="hidden md:block absolute top-1/2 -left-6 transform -translate-y-1/2 z-10 w-12 text-slate-300">
                   <ArrowRight className="w-8 h-8" />
                </div>
                <div className="bg-green-100 text-green-600 p-4 rounded-full mb-6">
                  <Sprout className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">2. Farmers Contribute</h3>
                <p className="text-slate-600">
                  Farmers can view active demands and commit their harvest. They can contribute individually or pool resources with neighboring farmers to meet large orders.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-50 rounded-2xl p-8 hover:shadow-xl transition duration-300 border border-slate-100 flex flex-col items-center text-center relative">
                <div className="hidden md:block absolute top-1/2 -left-6 transform -translate-y-1/2 z-10 w-12 text-slate-300">
                   <ArrowRight className="w-8 h-8" />
                </div>
                <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full mb-6">
                  <Banknote className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">3. Direct Automated Payment</h3>
                <p className="text-slate-600">
                  Upon successful delivery and quality check, payments are released directly into the farmers' bank accounts, cutting out all intermediary commissions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-800 pb-8 mb-8">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Sprout className="h-6 w-6 text-green-500" />
              <span className="text-xl font-bold text-white">Farm2Factory</span>
            </div>
            <div className="flex space-x-6">
              <span className="hover:text-white cursor-pointer transition">About</span>
              <span className="hover:text-white cursor-pointer transition">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition">Terms of Service</span>
              <span className="hover:text-white cursor-pointer transition">Contact</span>
            </div>
          </div>
          <div className="text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Farm2Factory Platform. All rights reserved. Transforming agriculture digitally.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
