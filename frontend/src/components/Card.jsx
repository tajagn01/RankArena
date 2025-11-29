import { Trophy, Users, Zap } from 'lucide-react';

function Card() {
    return (
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-20 w-full px-6">
            {/* Card 1 */}
            <div className="group transform transition-all duration-1000 translate-y-0 opacity-100 delay-100">
                <div className="relative p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:transform hover:scale-105 bg-white/5 backdrop-blur-sm h-full">
                    <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors duration-300">
                            <Trophy className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-white transition-colors duration-300">College Leaderboard</h3>
                        <p className="text-white/70 leading-relaxed group-hover:text-white/80 transition-colors duration-300">See how you stack up against other students from your college</p>
                    </div>
                </div>
            </div>

            {/* Card 2 */}
            <div className="group transform transition-all duration-1000 translate-y-0 opacity-100 delay-200">
                <div className="relative p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:transform hover:scale-105 bg-white/5 backdrop-blur-sm h-full">
                    <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors duration-300">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-white transition-colors duration-300">Peer Comparison</h3>
                        <p className="text-white/70 leading-relaxed group-hover:text-white/80 transition-colors duration-300">Compare your progress with friends and classmates</p>
                    </div>
                </div>
            </div>

            {/* Card 3 */}
            <div className="group transform transition-all duration-1000 translate-y-0 opacity-100 delay-300">
                <div className="relative p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:transform hover:scale-105 bg-white/5 backdrop-blur-sm h-full">
                    <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors duration-300">
                            <Zap className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-white transition-colors duration-300">Performance Insights</h3>
                        <p className="text-white/70 leading-relaxed group-hover:text-white/80 transition-colors duration-300">Get detailed insights into your LeetCode performance</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Card;