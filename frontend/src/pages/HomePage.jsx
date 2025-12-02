import GridBackground from "../components/GridBackground";
import HeroPart from "../components/HeroPart";
import Card from "../components/Card";
import Footer from "../components/Footer";

function HomePage() {
    return (
        <>
            <GridBackground />
            <HeroPart />
            <div className="relative z-10 pb-20">
                <Card />
            </div>
            <Footer />
        </>
    );
}

export default HomePage;