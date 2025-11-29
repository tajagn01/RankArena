import { CodeXml } from 'lucide-react';

function HeroPart() {   
    return (
        <>
           <div className="relative z-10 min-h-screen flex flex-col justify-center items-center text-white font-satoshi tracking-wide px-4">

                {/* Add your page content here */}
                <div className="w-auto  px-6  p-2 m-2 border rounded-full flex flex-row items-center gap-2 mb-6 bg-transparent border-gray-100 hover:bg-gray-100 hover:text-black hover:scale-105 transition-all cursor-pointer text-white">
                    <CodeXml />
                    <h5 className="opacity-100">LeetCode College Rankings</h5>
                </div>
                <h1 className="text-4xl md:text-6xl py-5 w-auto  bg-linear-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text text-center">
                    Discover Your
                    College Rank
                </h1>

                <p className="text-sm md:text-xl text-gray-400 max-w-2xl text-center">
                   Compare your LeetCode performance with peers from your college and climb the leaderboard
                </p>

                {/* Example Button */}
                <button className="mt-8 px-8 py-3 bg-blue-600 text-white font-semibold relative overflow-hidden group transition-all duration-300 hover:scale-105  rounded-2xl ">
                    <span className="absolute inset-0 bg-blue-700 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 rounded-2xl"></span>
                    <span className="relative z-10">Get Started</span>
                </button>

            </div>
        </>
    );
}

export default HeroPart;