import DeliveryInfo from "./components/DeliveryInfo";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import ModelsGallery from "./components/ModelsGallery";
import Navbar from "./components/Navbar";
import Showcase from "./components/Showcase";

export default function App() {
	return (
		<div className="min-h-screen bg-soft-white">
			<Navbar />
			<main>
				<Hero />
				<HowItWorks />
				<ModelsGallery />
				<Showcase />
				<DeliveryInfo />
			</main>
			<Footer />
		</div>
	);
}
