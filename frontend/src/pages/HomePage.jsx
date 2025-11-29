import GridBackground from "../components/GridBackground";
import HeroPart from "../components/HeroPart";
import NavBar from "../components/NavBar";
import Card from "../components/Card";
import Footer from "../components/Footer";

function HomePage() {
    return (
        <>
            {/* 1. Background Layer: Fixed position, stays behind everything */}
            <GridBackground />

            {/* 2. Navigation Layer: Scrolls with content */}
            <NavBar />

            {/* 3. Main Content Layer: Sits on top of the background */}
            <HeroPart />
            
            {/* 4. Cards Layer: Appears after scrolling */}
            <div className="relative z-10 pb-20">
                <Card />
            </div>
            <Footer />
        </>
    );
}

export default HomePage;