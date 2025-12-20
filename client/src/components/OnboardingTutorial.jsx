import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, MessageCircle, Users, Image, Sparkles, Heart } from 'lucide-react';

const tutorials = [
    {
        id: 0,
        title: "Welcome to HobbyHub!",
        description: "Your ultimate platform to connect, share, and grow.",
        icon: <Sparkles size={48} />,
        color: "#F59E0B" // Amber
    },
    {
        id: 0.5,
        title: "About Us",
        description: "We are a safe space for hobbyists to explore their passions together.",
        icon: <Heart size={48} />,
        color: "#EC4899" // Pink
    },
    {
        id: 1,
        title: "Share Your World",
        description: "Create posts with images and music to express yourself.",
        icon: <Image size={48} />,
        color: "var(--accent)"
    },
    {
        id: 2,
        title: "Join Communities",
        description: "Find and join groups that match your interests.",
        icon: <Users size={48} />,
        color: "#8B5CF6" // Violet
    },
    {
        id: 3,
        title: "Global Chat",
        description: "Connect with everyone in the global chat room.",
        icon: <MessageCircle size={48} />,
        color: "#10B981" // Emerald
    }
];

const OnboardingTutorial = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        if (!hasStarted) return;

        const timer = setInterval(() => {
            setCurrentStep((prev) => {
                if (prev < tutorials.length - 1) {
                    return prev + 1;
                } else {
                    clearInterval(timer);
                    setTimeout(onComplete, 1000); // Wait a bit after last slide before closing
                    return prev;
                }
            });
        }, 1500); // 1.5 seconds per slide

        // Play intro sound
        const audio = new Audio('/intro.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Intro audio blocked:', e));

        return () => {
            clearInterval(timer);
            // Optionally stop audio if it's still playing when component unmounts
            audio.pause();
            audio.currentTime = 0;
        };
    }, [hasStarted, onComplete]);

    const handleStart = () => {
        setHasStarted(true);
    };

    const handleSkip = () => {
        onComplete();
    };

    if (!hasStarted) {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'linear-gradient(135deg, var(--bg-primary) 0%, #1a1a1a 100%)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', zIndex: 3000,
                padding: '20px'
            }}>
                {/* Background Blobs */}
                <div style={{
                    position: 'absolute', top: '20%', left: '20%', width: '300px', height: '300px',
                    background: 'var(--accent)', filter: 'blur(100px)', opacity: 0.2, borderRadius: '50%'
                }} />
                <div style={{
                    position: 'absolute', bottom: '20%', right: '20%', width: '250px', height: '250px',
                    background: '#8B5CF6', filter: 'blur(100px)', opacity: 0.2, borderRadius: '50%'
                }} />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="glass-panel"
                    style={{
                        padding: '60px 40px',
                        textAlign: 'center',
                        maxWidth: '500px',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '30px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                    }}
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '20px',
                            borderRadius: '50%',
                            marginBottom: '10px'
                        }}
                    >
                        <Users size={64} color="var(--accent)" />
                    </motion.div>

                    <div>
                        <h1 style={{
                            color: 'var(--text-primary)',
                            fontSize: '3rem',
                            marginBottom: '10px',
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: '700',
                            letterSpacing: '-1px'
                        }}>
                            HobbyHub
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                            Discover. Connect. Belong.
                        </p>
                    </div>

                    <button
                        onClick={handleStart}
                        className="btn btn-primary"
                        style={{
                            fontSize: '1.2rem',
                            padding: '16px 48px',
                            borderRadius: '50px',
                            background: 'var(--accent)',
                            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                            transform: 'translateY(0)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        Start Experience
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'var(--bg-primary)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}
        >
            <button
                onClick={handleSkip}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                }}
            >
                Skip <ArrowRight size={16} />
            </button>

            <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '20px'
                        }}
                    >
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: tutorials[currentStep].color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            marginBottom: '20px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}>
                            {tutorials[currentStep].icon}
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
                            {tutorials[currentStep].title}
                        </h2>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            {tutorials[currentStep].description}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Progress Indicators */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '40px' }}>
                {tutorials.map((_, index) => (
                    <motion.div
                        key={index}
                        animate={{
                            width: index === currentStep ? 24 : 8,
                            backgroundColor: index === currentStep ? 'var(--accent)' : 'var(--text-secondary)',
                            opacity: index === currentStep ? 1 : 0.3
                        }}
                        style={{
                            height: '8px',
                            borderRadius: '4px'
                        }}
                    />
                ))}
            </div>

            <p style={{ marginTop: '30px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Setting up your experience...
            </p>
        </motion.div>
    );
};

export default OnboardingTutorial;
