import { CodeXml, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function HeroPart() {
    const navigate = useNavigate();
    
    useEffect(() => {
        // Trigger animations on mount
        const timer = setTimeout(() => {
            document.querySelectorAll('.hero-reveal').forEach((el, index) => {
                setTimeout(() => {
                    el.classList.add('active');
                }, index * 150);
            });
        }, 100);
        return () => clearTimeout(timer);
    }, []);
    
    const handleGetStarted = () => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            navigate('/dashboard');
        } else {
            navigate('/signup');
        }
    };
    
    return (
        <>
           <div className="relative z-10 min-h-screen flex flex-col justify-center items-center text-white font-satoshi tracking-wide px-4">

              
                <div className="hero-reveal w-auto px-6 p-2 m-2 border rounded-full flex flex-row items-center gap-2 mb-6 bg-transparent border-gray-100 hover:bg-gray-100 hover:text-black hover:scale-105 transition-all cursor-pointer text-white opacity-0 translate-y-8" style={{ transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    <CodeXml />
                    <h5 className="opacity-100">LeetCode College Rankings</h5>
                </div>
                <h1 className="hero-reveal text-4xl md:text-6xl py-5 w-auto bg-linear-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text text-center opacity-0 translate-y-8 font-excon font-bold" style={{ transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    Discover Your
                    College Rank
                </h1>

                <p className="hero-reveal text-sm md:text-xl text-gray-400 max-w-2xl text-center opacity-0 translate-y-8" style={{ transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                   Compare your LeetCode performance with peers from your college and climb the leaderboard
                </p>

                <button 
                    onClick={handleGetStarted}
                    className="hero-reveal mt-8 px-8 py-3 bg-blue-600 text-white font-semibold relative overflow-hidden group transition-all duration-300 hover:scale-105 rounded-2xl cursor-pointer opacity-0 translate-y-8"
                    style={{ transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
                >
                    <span className="absolute inset-0 bg-blue-700 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 rounded-2xl"></span>
                    <span className="relative z-10">Get Started</span>
                </button>

                <div className="hero-reveal mt-16 flex flex-col items-center gap-2 opacity-0 translate-y-8 animate-bounce" style={{ transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    <span className="text-white/50 text-sm">Scroll Down</span>
                    <ChevronDown className="w-5 h-5 text-white/50" />
                </div>

            </div>
        </>
    );
}

export default HeroPart;