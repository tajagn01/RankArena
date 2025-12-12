import { Trophy, Users, Zap } from 'lucide-react';
import { useEffect, useRef } from 'react';

function Card() {
    const containerRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const cards = entry.target.querySelectorAll('.card-reveal');
                        cards.forEach((card, index) => {
                            setTimeout(() => {
                                card.classList.add('active');
                            }, index * 150);
                        });
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-20 w-full px-6">
            <div className="card-reveal group opacity-0 translate-y-12" style={{ transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
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

            <div className="card-reveal group opacity-0 translate-y-12" style={{ transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
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

            <div className="card-reveal group opacity-0 translate-y-12" style={{ transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
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