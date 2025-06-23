import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

const FeatureCard = React.memo(({ icon, title, children }) => (
  <motion.div
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className="bg-surface p-8 rounded-2xl shadow-lg border border-border text-center"
  >
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-text mb-2">{title}</h3>
    <p className="text-text-secondary">{children}</p>
  </motion.div>
));

const PricingCard = React.memo(
  ({ plan, price, features, primary = false, onChoosePlan }) => {
    const cardRef = useRef(null);
    const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });

    const handleMouseMove = (e) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    };

    return (
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePosition({ x: -100, y: -100 })}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        className={`relative p-8 rounded-2xl border-2 h-full flex flex-col overflow-hidden ${
          primary
            ? "bg-surface shadow-2xl border-primary"
            : "bg-surface shadow-lg border-border"
        }`}
        style={{
          background: primary
            ? `radial-gradient(400px at ${mousePosition.x}px ${mousePosition.y}px, rgba(51, 132, 255, 0.15), transparent 80%)`
            : `radial-gradient(400px at ${mousePosition.x}px ${mousePosition.y}px, rgba(129, 132, 152, 0.1), transparent 80%)`,
        }}
      >
        <div className="relative z-10 flex flex-col h-full">
          {primary && (
            <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-sm font-semibold rounded-full">
              Most Popular
            </div>
          )}
          <h3
            className={`text-xl font-bold mb-2 ${
              primary ? "text-primary" : "text-text"
            }`}
          >
            {plan}
          </h3>
          <p className="text-5xl font-extrabold text-text mb-4">{price}</p>
          <p className="text-text-secondary mb-8 flex-grow">{features}</p>
          <button
            onClick={onChoosePlan}
            className={`inline-block w-full text-center font-bold text-lg px-8 py-3 rounded-xl shadow-md transition-all duration-200 transform hover:scale-105 ${
              primary
                ? "bg-primary text-white hover:bg-blue-700"
                : "bg-surface-secondary text-text hover:bg-border border border-border"
            }`}
          >
            Choose {plan}
          </button>
        </div>
      </motion.div>
    );
  }
);

const LandingPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, setTheme } = useOutletContext();

  const handleUpgrade = async () => {
    try {
      const response = await fetch(
        "http://localhost:4242/create-checkout-session",
        {
          method: "POST",
        }
      );
      const session = await response.json();
      window.location.href = session.url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 bg-background text-text`}
    >
      <header className="absolute top-0 left-0 right-0 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-text">AIBud</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-surface transition-colors"
          >
            {theme ? (
              <Sun className="w-6 h-6 text-yellow-400" />
            ) : (
              <Moon className="w-6 h-6 text-text-secondary" />
            )}
          </button>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 pt-32 pb-24 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl font-extrabold mb-4 text-text"
          >
            Meet Your Smarter AI Assistant{" "}
            <span role="img" aria-label="robot">
              🤖✨
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-10"
          >
            Unlock the full potential of AI with more freedom, conversations,
            and real help.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link
              to="/chat"
              className="inline-block bg-primary text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              Get Started for Free{" "}
              <span role="img" aria-label="rocket">
                🚀
              </span>
            </Link>
          </motion.div>
        </section>

        <section className="container mx-auto px-4 pb-24">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard icon="🎁" title="Generous Free Plan">
              Start with 100 free chats monthly. Build habits before you ever
              need to upgrade.
            </FeatureCard>
            <FeatureCard icon="👨‍🏫" title="Multiple Personalities">
              Switch between professional, casual, coaching, or friendly
              assistant modes.
            </FeatureCard>
            <FeatureCard icon="⚡️" title="Fast & Secure">
              State-of-the-art AI models and encrypted data protection for your
              privacy.
            </FeatureCard>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-24">
          <h2 className="text-4xl font-extrabold text-center mb-16 text-text">
            Simple Pricing for Everyone
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto items-start">
            <PricingCard
              plan="Free"
              price="$0"
              features="100 messages per month. The perfect way to get started."
              onChoosePlan={() => navigate("/chat")}
            />
            <PricingCard
              plan="Pro"
              price="$9.99/mo"
              features="Unlimited messages, access to all models, and priority support."
              primary={true}
              onChoosePlan={handleUpgrade}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
