import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Hero } from './sections/Hero';
import { Problem } from './sections/Problem';
import { Features } from './sections/Features';
import { TwoSides } from './sections/TwoSides';
import { Compliance } from './sections/Compliance';
import { Pricing } from './sections/Pricing';
import { FAQ } from './sections/FAQ';
import { CTA } from './sections/CTA';

export function App() {
  return (
    <div className="overflow-hidden">
      <Navbar />
      <Hero />
      <Problem />
      <Features />
      <TwoSides />
      <Compliance />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
