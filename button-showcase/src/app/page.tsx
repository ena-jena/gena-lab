'use client';

import { useState } from 'react';

export default function ButtonShowcase() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <>
      <style jsx global>{`
       @font-face {
            font-family: 'Poppins';
            src: url(data:font/woff2;charset=utf-8;base64,INSERTA_TODO_EL_BASE64_AQUI) format('woff2');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
        }

        * {
            font-family: 'Poppins', sans-serif !important;
        }
        .animate-gradient-light {
          background: linear-gradient(120deg, #e0e7ff 0%, #f3e8ff 50%, #c7d2fe 100%);
          background-size: 200% 200%;
          animation: gradientLightMove 12s ease-in-out infinite;
          transition: background 0.7s cubic-bezier(.4,0,.2,1);
        }
        .animate-gradient-dark {
          background: linear-gradient(120deg, #181c2a 0%, #232946 50%, #3b1f47 100%);
          background-size: 200% 200%;
          animation: gradientDarkMove 14s ease-in-out infinite;
          transition: background 0.7s cubic-bezier(.4,0,.2,1);
        }
        .radial-spotlight {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(ellipse 80% 60% at 60% 40%, rgba(80,80,180,0.18) 0%, rgba(24,28,42,0.0) 100%);
          opacity: 0.7;
          animation: radialPulse 8s ease-in-out infinite alternate;
          transition: opacity 0.7s cubic-bezier(.4,0,.2,1);
        }
        @keyframes gradientLightMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes gradientDarkMove {
          0% { background-position: 100% 0%; }
          50% { background-position: 0% 100%; }
          100% { background-position: 100% 0%; }
        }
        @keyframes radialPulse {
          0% { opacity: 0.7; }
          100% { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeInCard 0.8s cubic-bezier(.4,0,.2,1) both;
        }
        @keyframes fadeInCard {
          0% { opacity: 0; transform: translateY(24px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div>
        <div className={`fixed inset-0 -z-10 transition-all duration-700 ${isDarkMode ? 'animate-gradient-dark' : 'animate-gradient-light'}`}></div>
        {isDarkMode && (
          <div className="radial-spotlight -z-10" />
        )}
        <div className={`min-h-screen transition-colors duration-300 relative ${
          isDarkMode 
            ? 'text-white' 
            : 'text-gray-900'
        }`}>
          <nav className={`fixed top-0 w-full z-50 transition-colors duration-300 shadow-2xl ${
            isDarkMode 
              ? 'bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 border-b border-gray-800' 
              : 'bg-gradient-to-r from-white via-blue-50 to-purple-100 border-b border-blue-100'
          }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-lg mr-3 flex items-center justify-center shadow-md ${
                    isDarkMode ? 'bg-blue-600' : 'bg-gradient-to-br from-blue-600 to-purple-600'
                  }`}>
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className={`text-xl font-bold tracking-tight ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    DesignPro UI
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleDarkMode}
                    className={`relative flex items-center h-10 w-20 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 px-2
                      ${isDarkMode
                        ? 'bg-blue-600 focus:ring-blue-500'
                        : 'bg-gray-300 border border-gray-400/60 shadow-md focus:ring-gray-500'}
                    `}
                  >
                    <span className="sr-only">Toggle dark mode</span>
                    <span className="flex-shrink-0 z-10">
                      <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span
                      className={`absolute left-2 top-1/2 transform -translate-y-1/2 transition-transform duration-300 h-8 w-8 rounded-full bg-white shadow-lg ring-0 z-20 ${
                        isDarkMode ? 'translate-x-10' : 'translate-x-0'
                      }`}
                    />
                    <span className="flex-shrink-0 ml-auto z-10">
                      <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <main className="pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <div className="mb-6">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    isDarkMode 
                      ? 'bg-purple-900/50 text-purple-300 border border-purple-700' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    Component Library
                  </span>
                </div>
                <h1 className={`text-4xl md:text-5xl font-bold tracking-tight mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Button Component Library
                </h1>
                <p className={`text-xl max-w-3xl mx-auto ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  A comprehensive collection of button styles designed for accessibility, 
                  consistency, and visual appeal across all use cases.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                <div className={`group relative p-8 rounded-2xl border overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 ${
                  isDarkMode 
                    ? 'bg-gray-900 border-[1.5px] border-blue-900/40' 
                    : 'bg-white border-[1.5px] border-blue-200/60'
                } animate-fade-in`}
                  style={{boxShadow: '0 4px 32px 0 rgba(80,80,180,0.10), 0 1.5px 6px 0 rgba(80,80,180,0.06), inset 0 1.5px 8px 0 rgba(80,80,180,0.04)'}}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Primary Buttons
                    </h3>
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm transition-all duration-300 select-none
                      ${isDarkMode
                        ? 'bg-gradient-to-r from-emerald-500 via-emerald-700 to-emerald-900 text-emerald-100'
                        : 'bg-gradient-to-r from-green-100 via-emerald-200 to-blue-100 text-emerald-700'}
                    `}
                      style={{boxShadow: isDarkMode ? '0 2px 8px 0 rgba(16,185,129,0.18)' : '0 2px 8px 0 rgba(16,185,129,0.08)'}}
                    >
                      Recommended
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Active
                      </span>
                      <button className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                        ${isDarkMode
                          ? 'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 focus:ring-blue-400'
                          : 'bg-blue-500 text-white hover:bg-blue-400 active:bg-blue-600 focus:ring-blue-300'}
                      `}>
                        Get Started
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Disabled
                      </span>
                      <button disabled className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow text-gray-400 bg-gray-300 cursor-not-allowed">
                        Get Started
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`group relative p-8 rounded-2xl border overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 ${
                  isDarkMode 
                    ? 'bg-gray-900 border-[1.5px] border-blue-900/40' 
                    : 'bg-white border-[1.5px] border-blue-200/60'
                } animate-fade-in`}
                  style={{boxShadow: '0 4px 32px 0 rgba(80,80,180,0.10), 0 1.5px 6px 0 rgba(80,80,180,0.06), inset 0 1.5px 8px 0 rgba(80,80,180,0.04)'}}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Secondary Buttons
                    </h3>
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm transition-all duration-300 select-none
                      ${isDarkMode
                        ? 'bg-gradient-to-r from-blue-500 via-blue-700 to-blue-900 text-blue-100'
                        : 'bg-gradient-to-r from-blue-100 via-cyan-200 to-purple-100 text-cyan-700'}
                    `}
                      style={{boxShadow: isDarkMode ? '0 2px 8px 0 rgba(59,130,246,0.18)' : '0 2px 8px 0 rgba(59,130,246,0.08)'}}
                    >
                      Accessible
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Active
                      </span>
                      <button className={`inline-flex items-center px-6 py-3 border-2 text-base font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105 hover:shadow-xl active:scale-95 active:shadow focus:shadow-lg ${
                        isDarkMode
                          ? 'border-gray-600 text-gray-300 bg-gray-900 hover:bg-gray-700 focus:ring-gray-500'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500'
                      }`}>
                        Learn More
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Disabled
                      </span>
                      <button disabled className={`inline-flex items-center px-6 py-3 border-2 text-base font-medium rounded-lg cursor-not-allowed ${
                        isDarkMode
                          ? 'border-gray-700 text-gray-500 bg-gray-800'
                          : 'border-gray-200 text-gray-400 bg-gray-100'
                      }`}>
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`group relative p-8 rounded-2xl border overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 ${
                  isDarkMode 
                    ? 'bg-gray-900 border-[1.5px] border-blue-900/40' 
                    : 'bg-white border-[1.5px] border-blue-200/60'
                } animate-fade-in`}
                  style={{boxShadow: '0 4px 32px 0 rgba(80,80,180,0.10), 0 1.5px 6px 0 rgba(80,80,180,0.06), inset 0 1.5px 8px 0 rgba(80,80,180,0.04)'}}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Outlined Buttons
                    </h3>
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm transition-all duration-300 select-none
                      ${isDarkMode
                        ? 'bg-gradient-to-r from-pink-500 via-purple-700 to-purple-900 text-pink-100'
                        : 'bg-gradient-to-r from-purple-100 via-pink-200 to-purple-100 text-pink-700'}
                    `}
                      style={{boxShadow: isDarkMode ? '0 2px 8px 0 rgba(236,72,153,0.18)' : '0 2px 8px 0 rgba(236,72,153,0.08)'}}
                    >
                      Modern
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Active
                      </span>
                      <button className="inline-flex items-center px-6 py-3 border-2 border-blue-600 text-base font-medium rounded-lg text-blue-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 hover:bg-blue-50 hover:shadow-xl active:scale-95 active:shadow focus:shadow-lg">
                        Download
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Disabled
                      </span>
                      <button disabled className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-base font-medium rounded-lg text-gray-400 bg-transparent cursor-not-allowed">
                        Download
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`group relative p-8 rounded-2xl border overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 ${
                  isDarkMode 
                    ? 'bg-gray-900 border-[1.5px] border-blue-900/40' 
                    : 'bg-white border-[1.5px] border-blue-200/60'
                } animate-fade-in`}
                  style={{boxShadow: '0 4px 32px 0 rgba(80,80,180,0.10), 0 1.5px 6px 0 rgba(80,80,180,0.06), inset 0 1.5px 8px 0 rgba(80,80,180,0.04)'}}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Link Buttons
                    </h3>
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm transition-all duration-300 select-none
                      ${isDarkMode
                        ? 'bg-gradient-to-r from-orange-500 via-red-700 to-gray-900 text-orange-100'
                        : 'bg-gradient-to-r from-orange-100 via-red-200 to-orange-100 text-orange-700'}
                    `}
                      style={{boxShadow: isDarkMode ? '0 2px 8px 0 rgba(251,146,60,0.18)' : '0 2px 8px 0 rgba(251,146,60,0.08)'}}
                    >
                      Minimal
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Active
                      </span>
                      <button className={`inline-flex items-center px-6 py-3 text-base font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105 hover:shadow-xl active:scale-95 active:shadow focus:shadow-lg ${
                        isDarkMode
                          ? 'text-blue-400 hover:text-blue-300 focus:ring-blue-500'
                          : 'text-blue-600 hover:text-blue-500 focus:ring-blue-500'
                      }`}>
                        View Details
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Disabled
                      </span>
                      <button disabled className={`inline-flex items-center px-6 py-3 text-base font-medium rounded-lg cursor-not-allowed ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`group relative p-8 rounded-2xl border overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 ${
                isDarkMode 
                  ? 'bg-gray-900 border-[1.5px] border-blue-900/40' 
                  : 'bg-white border-[1.5px] border-blue-200/60'
              } animate-fade-in`}
                style={{boxShadow: '0 4px 32px 0 rgba(80,80,180,0.10), 0 1.5px 6px 0 rgba(80,80,180,0.06), inset 0 1.5px 8px 0 rgba(80,80,180,0.04)'}}
              >
                <h3 className={`text-2xl font-bold text-center mb-8 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Design System Features
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300
                      ${isDarkMode ? 'bg-gray-950 border border-blue-900/40 shadow-lg' : 'bg-white border border-blue-200/60 shadow-md'}`}>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className={`font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Consistent Design
                    </h4>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Unified visual language across all components
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300
                      ${isDarkMode ? 'bg-gray-950 border border-blue-900/40 shadow-lg' : 'bg-white border border-blue-200/60 shadow-md'}`}>
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="7" r="2" className={isDarkMode ? 'stroke-cyan-300' : 'stroke-cyan-600'} fill={isDarkMode ? '#22d3ee' : '#06b6d4'} />
                        <path d="M4 10c2.5 1 5.5 1 8 1s5.5 0 8-1" className={isDarkMode ? 'stroke-cyan-300' : 'stroke-cyan-600'} strokeLinecap="round" />
                        <path d="M12 9v7m0 0l-3 4m3-4l3 4" className={isDarkMode ? 'stroke-cyan-300' : 'stroke-cyan-600'} strokeLinecap="round" />
                      </svg>
                    </div>
                    <h4 className={`font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Accessibility First
                    </h4>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      WCAG compliant with proper focus states
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300
                      ${isDarkMode ? 'bg-gray-950 border border-blue-900/40 shadow-lg' : 'bg-white border border-blue-200/60 shadow-md'}`}>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className={`font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Performance Optimized
                    </h4>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Lightweight and fast-loading components
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
