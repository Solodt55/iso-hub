import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Shield, 
  DollarSign, 
  FileText, 
  Lock, 
  Bot, 
  Key, 
  Cloud, 
  Users,
  BrainCircuit,
  X
} from 'lucide-react';

interface Slide {
  title: string;
  content: React.ReactNode;
  icon: React.ComponentType;
  bgImage?: string;
}

interface PitchDeckProps {
  onClose?: () => void;
}

export default function PitchDeck({ onClose }: PitchDeckProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      title: "Welcome to ISOHub",
      content: (
        <div className="space-y-4">
          <p className="text-xl">Your All-in-One ISO Management Platform</p>
          <ul className="space-y-2">
            <li>✓ Document Management</li>
            <li>✓ Residuals Tracking</li>
            <li>✓ AI-Powered Assistant</li>
            <li>✓ Secure Document Portal</li>
            <li>✓ Centralized Logins</li>
          </ul>
        </div>
      ),
      icon: Shield,
      bgImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920"
    },
    {
      title: "Residuals Module",
      content: (
        <div className="space-y-4">
          <p className="text-xl">Complete Residual Management</p>
          <ul className="space-y-2">
            <li>• Real-time portfolio tracking</li>
            <li>• Multi-processor support</li>
            <li>• Automated reconciliation</li>
            <li>• Performance analytics</li>
            <li>• Commission splits</li>
          </ul>
        </div>
      ),
      icon: DollarSign,
      bgImage: "https://images.unsplash.com/photo-1543286386-2e659306cd6c?auto=format&fit=crop&w=1920"
    },
    {
      title: "AI-Powered Assistant",
      content: (
        <div className="space-y-4">
          <p className="text-xl">Meet JACC - Your ISO Expert</p>
          <ul className="space-y-2">
            <li>• Instant documentation answers</li>
            <li>• Processing knowledge base</li>
            <li>• Integration guidance</li>
            <li>• Voice & text interface</li>
            <li>• 24/7 availability</li>
          </ul>
        </div>
      ),
      icon: Bot,
      bgImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1920"
    },
    {
      title: "Secure Document Portal",
      content: (
        <div className="space-y-4">
          <p className="text-xl">Enterprise-Grade Security</p>
          <ul className="space-y-2">
            <li>• End-to-end encryption</li>
            <li>• Granular access controls</li>
            <li>• Audit trails</li>
            <li>• Secure sharing</li>
            <li>• Compliance ready</li>
          </ul>
        </div>
      ),
      icon: Lock,
      bgImage: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1920"
    },
    {
      title: "Centralized Logins",
      content: (
        <div className="space-y-4">
          <p className="text-xl">One Dashboard, All Access</p>
          <ul className="space-y-2">
            <li>• Single sign-on</li>
            <li>• Processor portals</li>
            <li>• Gateway access</li>
            <li>• Hardware management</li>
            <li>• Role-based permissions</li>
          </ul>
        </div>
      ),
      icon: Key,
      bgImage: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1920"
    },
    {
      title: "Cloud Integration",
      content: (
        <div className="space-y-4">
          <p className="text-xl">Seamless Document Sync</p>
          <ul className="space-y-2">
            <li>• Google Drive integration</li>
            <li>• Real-time sync</li>
            <li>• Automatic indexing</li>
            <li>• Version control</li>
            <li>• Collaborative editing</li>
          </ul>
        </div>
      ),
      icon: Cloud,
      bgImage: "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?auto=format&fit=crop&w=1920"
    },
    {
      title: "AI Knowledge Base",
      content: (
        <div className="space-y-4">
          <p className="text-xl">Your Team's Brain</p>
          <ul className="space-y-2">
            <li>• Natural language queries</li>
            <li>• Context-aware responses</li>
            <li>• Multi-role support</li>
            <li>• Training integration</li>
            <li>• Continuous learning</li>
          </ul>
        </div>
      ),
      icon: BrainCircuit,
      bgImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1920"
    },
    {
      title: "User Roles",
      content: (
        <div className="space-y-4">
          <p className="text-xl">Role-Based Access</p>
          <ul className="space-y-2">
            <li>• Sales Representatives</li>
            <li>• Management Dashboard</li>
            <li>• Admin Controls</li>
            <li>• Custom Permissions</li>
            <li>• Activity Monitoring</li>
          </ul>
        </div>
      ),
      icon: Users,
      bgImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1920"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'Escape' && onClose) onClose();
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSlideClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x > rect.width / 2) {
      nextSlide();
    } else {
      prevSlide();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      )}

      <div className="relative w-full max-w-6xl mx-auto px-4">
        {/* Slide */}
        <div 
          className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-tracer-green/20 cursor-pointer"
          onClick={handleSlideClick}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-10 transition-opacity duration-500"
            style={{ backgroundImage: `url(${slides[currentSlide].bgImage})` }}
          />
          <div className="relative z-10 p-12">
            <div className="flex items-center space-x-4 mb-8">
              {React.createElement(slides[currentSlide].icon, {
                className: "h-12 w-12 text-tracer-green"
              })}
              <h2 className="text-4xl font-bold text-white">
                {slides[currentSlide].title}
              </h2>
            </div>
            <div className="text-gray-300">
              {slides[currentSlide].content}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="absolute inset-x-0 bottom-4 flex items-center justify-center space-x-4">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full bg-tracer-green/10 text-tracer-green hover:bg-tracer-green/20 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="text-tracer-green">
            {currentSlide + 1} / {slides.length}
          </div>
          <button
            onClick={nextSlide}
            className="p-2 rounded-full bg-tracer-green/10 text-tracer-green hover:bg-tracer-green/20 transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}