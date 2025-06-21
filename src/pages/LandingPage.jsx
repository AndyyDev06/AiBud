import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

const FeatureCard = React.memo(({ icon, title, children }) => (
  <motion.div
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className="bg-light-surface dark:bg-dark-surface p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-dark-surface text-center"
  >
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">
      {title}
    </h3>
    <p className="text-light-secondary dark:text-dark-secondary">{children}</p>
  </motion.div>
));

const PricingCard = React.memo(({ plan, price, features, primary = false }) => {
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
          ? "bg-light-surface dark:bg-dark-surface shadow-2xl border-light-primary"
          : "bg-light-surface dark:bg-dark-surface shadow-lg border-gray-200 dark:border-dark-surface"
      }`}
      style={{
        background: primary
          ? `radial-gradient(400px at ${mousePosition.x}px ${mousePosition.y}px, rgba(51, 132, 255, 0.15), transparent 80%)`
          : `radial-gradient(400px at ${mousePosition.x}px ${mousePosition.y}px, rgba(129, 132, 152, 0.1), transparent 80%)`,
        backgroundColor: primary ? "#171E39" : "#171E39", // Fallback for dark
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(400px at ${mousePosition.x}px ${mousePosition.y}px, rgba(51, 132, 255, 0.1), transparent 80%)`,
          backgroundColor: "#FFFFFF", // Fallback for light
        }}
      ></div>

      <div className="relative z-10 flex flex-col h-full">
        {primary && (
          <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1 bg-light-primary text-white text-sm font-semibold rounded-full">
            Most Popular
          </div>
        )}
        <h3
          className={`text-xl font-bold mb-2 ${
            primary
              ? "text-light-primary dark:text-dark-primary"
              : "text-light-text dark:text-dark-text"
          }`}
        >
          {plan}
        </h3>
        <p className="text-5xl font-extrabold text-light-text dark:text-dark-text mb-4">
          {price}
        </p>
        <p className="text-light-secondary dark:text-dark-secondary mb-8 flex-grow">
          {features}
        </p>
        <Link
          to="/chat"
          className={`inline-block w-full text-center font-bold text-lg px-8 py-3 rounded-xl shadow-md transition-all duration-200 transform hover:scale-105 ${
            primary
              ? "bg-light-primary text-white hover:bg-blue-700"
              : "bg-gray-200 dark:bg-dark-surface text-light-primary dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700"
          }`}
        >
          Choose {plan}
        </Link>
      </div>
    </motion.div>
  );
});

const LandingPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setIsDarkMode(savedTheme === "dark");
    else
      setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.style.setProperty("background-color", "#0A092D");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.setProperty("background-color", "#F2F5FF");
    }
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text`}
    >
      <header className="absolute top-0 left-0 right-0 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">
            AIBud
          </h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-surface transition-colors"
          >
            {isDarkMode ? (
              <Sun className="w-6 h-6 text-yellow-400" />
            ) : (
              <Moon className="w-6 h-6 text-light-secondary" />
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
            className="text-5xl md:text-6xl font-extrabold mb-4 text-light-text dark:text-dark-text"
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
            className="text-lg md:text-xl text-light-secondary dark:text-dark-secondary max-w-3xl mx-auto mb-10"
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
              className="inline-block bg-light-primary text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
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
          <h2 className="text-4xl font-extrabold text-center mb-16 text-light-text dark:text-dark-text">
            Simple Pricing for Everyone
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
            <PricingCard
              plan="Basic"
              price="$4.99/mo"
              features="Perfect to start your AI journey."
            />
            <PricingCard
              plan="Pro"
              price="$9.99/mo"
              features="Unlimited chats, custom personalities, advanced tools."
              primary={true}
            />
            <PricingCard
              plan="Team"
              price="$44.99/mo"
              features="For growing teams with shared workspaces & admin tools."
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
