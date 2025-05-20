import React from 'react';

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation placeholder */}
      <div className="bg-[#003554] text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold">SociallyFounded</div>
          <div className="hidden md:flex space-x-6">
            <a href="#" className="hover:text-gray-300">Home</a>
            <a href="#" className="border-b-2 border-white">About Us</a>
            <a href="#" className="hover:text-gray-300">Join</a>
            <a href="#" className="hover:text-gray-300">Contact</a>
          </div>
          <button className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hero section */}
      <div className="relative bg-[#003554] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">SociallyFounded isn't a company. It's a movement.</h1>
          <p className="text-xl max-w-3xl">Where ideas are nurtured through both human connection and AI assistance.</p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gray-50" style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%, 0% 100%)' }}></div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <p className="text-xl mb-6">
              We believe founders don't need fancy offices, corporate suits, or VC speak to bring bold ideas to life. 
              They need time, space, caffeine (or a pint), and a community.
            </p>
            <p className="text-xl mb-6">
              SF turns your favorite neighborhood cafés and pubs into co-working spaces, startup hubs, and networking zones — with a twist. 
              Our loyalty program doesn't reward how much you spend. It rewards how long you stay.
            </p>
          </div>

          {/* How it works section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-[#003554] mb-6">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-[#003554] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                <h3 className="text-xl font-medium mb-2">Stay</h3>
                <p>The longer you stay, the more points you earn</p>
              </div>
              <div className="text-center">
                <div className="bg-[#003554] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                <h3 className="text-xl font-medium mb-2">Earn</h3>
                <p>Accumulate points through your presence and participation</p>
              </div>
              <div className="text-center">
                <div className="bg-[#003554] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                <h3 className="text-xl font-medium mb-2">Unlock</h3>
                <p>Access startup benefits and resources as you progress</p>
              </div>
            </div>
          </div>

          {/* VCMBOK section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-[#003554] mb-6">VCMBoK — The Vibe Coding Methodology Body of Knowledge</h2>
            <p className="text-xl mb-6">
              Every founder has their own code, their own rhythm, their own vibe. This isn't just for tech bros. 
              This is for your aunt with a cookie idea, your neighbor with a local logistics hack, or the cab driver with a real estate app. 
              Everyone deserves startup support.
            </p>
            <p className="text-xl mb-6">
              We're not here to copy Y Combinator. We're here to democratize it — to bring the spirit of San Francisco to your street corner.
            </p>
          </div>

          {/* Benefits section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-[#003554] mb-6">Unlock Benefits</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-start">
                <div className="bg-[#003554] text-white p-2 rounded mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Expert Mentorship</h3>
                  <p>Connect with seasoned entrepreneurs and industry veterans</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-[#003554] text-white p-2 rounded mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">AI Tools</h3>
                  <p>Leverage cutting-edge AI to enhance your ideas and business</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-[#003554] text-white p-2 rounded mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Pitch Deck Support</h3>
                  <p>Get assistance crafting compelling presentations for investors</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-[#003554] text-white p-2 rounded mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Investor Access</h3>
                  <p>Connect with potential investors as your idea matures</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">Join the founder's table.</h2>
            <p className="text-xl mb-8">It's open. It's free. Just bring your idea and vibe. ✨</p>
            <p className="text-2xl font-light italic mb-8">Coffee optional. Conviction required.</p>
            <button className="bg-[#003554] text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-opacity-90 transition">
              Join The Movement
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#003554] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-2xl font-bold mb-4">SociallyFounded</h3>
              <p className="max-w-md">The intersection of community and entrepreneurship – where founding is socially enhanced.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-bold mb-4">Platform</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-gray-300">Home</a></li>
                  <li><a href="#" className="hover:text-gray-300">About Us</a></li>
                  <li><a href="#" className="hover:text-gray-300">Join</a></li>
                  <li><a href="#" className="hover:text-gray-300">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-gray-300">Terms</a></li>
                  <li><a href="#" className="hover:text-gray-300">Privacy</a></li>
                  <li><a href="#" className="hover:text-gray-300">Cookies</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Connect</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-gray-300">Twitter</a></li>
                  <li><a href="#" className="hover:text-gray-300">Instagram</a></li>
                  <li><a href="#" className="hover:text-gray-300">LinkedIn</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} SociallyFounded. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
