'use client';

import { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import RiskSimulator from '@/components/landing/RiskSimulator';
import FeatureShowcase from '@/components/landing/FeatureShowcase';
import DownloadPortal from '@/components/landing/DownloadPortal';
import AppDownloadModal from '@/components/landing/AppDownloadModal';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  return (
    <main style={{ background: '#f2efdc', minHeight: '100vh', color: '#1a1a1a' }}>
      <Navbar onOpenDownload={() => setIsDownloadOpen(true)} />
      <HeroSection onOpenDownload={() => setIsDownloadOpen(true)} />
      <RiskSimulator />
      <FeatureShowcase />
      <DownloadPortal onOpenDownload={() => setIsDownloadOpen(true)} />
      <Footer />
      <AppDownloadModal isOpen={isDownloadOpen} onClose={() => setIsDownloadOpen(false)} />
    </main>
  );
}
