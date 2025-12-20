import { motion } from 'framer-motion';
import { Users, Heart, Shield, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ textAlign: 'center', marginBottom: '80px' }}
            >
                <h1 style={{ fontSize: '3.5rem', marginBottom: '20px', background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    About HobbyHub
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto' }}>
                    Connecting passionate individuals across the globe to share, learn, and grow together in communities they love.
                </p>
            </motion.div>

            {/* Mission Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginBottom: '80px' }}>
                <FeatureCard
                    icon={<Users size={32} color="var(--accent)" />}
                    title="Community First"
                    description="We believe in the power of connection. Our platform is built to foster meaningful relationships and vibrant communities."
                />
                <FeatureCard
                    icon={<Heart size={32} color="#EC4899" />}
                    title="Passion Driven"
                    description="Whether it's painting, coding, or hiking, HobbyHub is the home for your hobbies. Share your world with others."
                />
                <FeatureCard
                    icon={<Shield size={32} color="#10B981" />}
                    title="Safe Space"
                    description="We prioritize safety and inclusivity. Our global chat and groups are moderated to ensure a welcoming environment."
                />
                <FeatureCard
                    icon={<Globe size={32} color="#3B82F6" />}
                    title="Global Reach"
                    description="Connect with like-minded people from every corner of the world. Your next best friend might be a continent away."
                />
            </div>

            {/* Story Section */}
            <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px' }}>
                <h2 style={{ fontSize: '2rem' }}>Our Story</h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '800px', lineHeight: '1.8' }}>
                    HobbyHub began with a simple idea: everyone has a passion, but not everyone has a place to share it.
                    started as a small project to connect local hobbyists has grown into a global platform where thousands of users
                    come together daily to discuss what they love. We are dedicated to keeping this platform free, fun, and focused on YOU.
                </p>
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center', marginTop: '80px' }}>
                <h2 style={{ marginBottom: '20px' }}>Ready to join the community?</h2>
                <Link to="/explore" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
                    Explore Posts
                </Link>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="glass-panel"
        style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}
    >
        <div style={{
            width: '60px', height: '60px', borderRadius: '16px', background: 'var(--bg-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px'
        }}>
            {icon}
        </div>
        <h3 style={{ fontSize: '1.4rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{description}</p>
    </motion.div>
);

export default About;
