import { Linkedin, X, Github } from 'lucide-react';
import { useEffect, useRef } from 'react';

function Footer() {
  const footerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <footer ref={footerRef} className="reveal w-full bg-[#0e0d0d] border-t border-white/10 py-8 mt-16 text-center text-white/70 text-sm relative z-10">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
  
        <div className="text-left md:w-2/3">
          <h2 className="text-xl font-bold text-white mb-2">LeetRank</h2>
          <p className="text-white/70 max-w-md">
            Empowering students to track their LeetCode progress and compete with peers from their college. Join LeetRank today and elevate your coding skills to new heights!
          </p>
        </div>
       
        <div className="text-left text-white/60 text-xs md:w-1/3 font-bold justify-start align-baseline">Build by: <br />Tajagn</div>
    
        <div className="flex flex-row gap-4 md:w-1/3 justify-end mt-6 md:mt-0">
          <a href="https://github.com/tajagn01" target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition">
            <Github className="w-6 h-6 text-white" />
          </a>
          <a href="https://www.linkedin.com/in/tajagn-garala-06ba45265/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition">
            <Linkedin className="w-6 h-6 text-white" />
          </a>
          <a href="https://x.com/Garala_Tajagn" target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition">
            <X className="w-6 h-6 text-white" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
