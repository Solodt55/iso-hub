import React, { useState, useEffect } from "react";
import {
  Shield,
  DollarSign,
  Users,
  FileText,
  Lock,
  Sparkles,
  Calendar,
  CheckCircle,
  Presentation,
} from "lucide-react";
import PitchDeck from "../components/PitchDeck";
import { useNavigate, useLocation, Link } from "react-router-dom";

export default function LandingPage() {
  const [showPitchDeck, setShowPitchDeck] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if we're on the landing page (/) and have a token
    const token = localStorage.getItem("auth_token");
    if (token && location.pathname === "/") {
      navigate("/logins");
    }
  }, [navigate, location]);

  const handleGetStarted = () => {
    // Open Calendly in a new tab
    window.open("https://calendly.com/your-calendar", "_blank");
  };

  const handleDashboard = () => {
    navigate("/login"); // redirect to login
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Version Toggle - for demo purposes */}
      <div className="fixed top-4 right-4 flex space-x-2 z-50">
        {/* <button
          onClick={() => setShowPitchDeck(true)}
          className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
        >
          <Presentation className="h-5 w-5" />
        </button> */}
      </div>

      {showPitchDeck && <PitchDeck onClose={() => setShowPitchDeck(false)} />}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute bg-gradient-to-br from-tracer-blue/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <img src="ISOHubLOGO.png" alt="" style={{ maxWidth: '15%' }} />

              {/* <Shield className="h-12 w-12 text-yellow-400" /> */}
              {/* <h1 className="text-4xl font-bold text-white ml-3">
                
                
              </h1> */}
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Streamline Your ISO Operations
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The all-in-one platform for Independent Sales Organizations to
              manage documents, process applications, and grow their merchant
              portfolio.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <a
                href="#calender"
                className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-tracer-green rounded-lg hover:bg-tracer-green/90 transition-colors duration-200"
              >
                Book a Demo
                <Calendar className="ml-2 h-5 w-5" />
              </a>
              <button
                onClick={handleDashboard}
                className="inline-flex items-center px-6 py-3 text-lg font-medium text-tracer-green bg-tracer-green/10 rounded-lg hover:bg-tracer-green/20 transition-colors duration-200 border border-tracer-green/20"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* secuity puspose images Section */}




      {/* Video Section */}
      {/* <div className="py-24 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              See ISOHub in Action
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Watch how ISOHub can transform your document management and
              streamline your operations.
            </p>
          </div>

          <div className="relative w-full max-w-4xl mx-auto bg-zinc-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="w-full h-[500px] bg-zinc-800 flex items-center justify-center">
              {" "}
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="ISOHub Demo Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </div> */}


      {/* Spacer Section */}
      <div className="h-16 bg-black"></div>

      {/* Features Grid */}
      <div className="py-24 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Secured File Gateway
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Powerful tools and features designed specifically for ISOs and
              merchant services providers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Document Management */}
            <div className="bg-zinc-800 rounded-xl p-6 border border-tracer-green/20 hover:bg-zinc-700 transition-colors duration-200">
              <div className="h-12 w-12 bg-tracer-green/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-tracer-green" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Document Management Hub
              </h3>
              <p className="text-gray-400">
                Securely store and organize processor agreements, gateway guides, and hardware documentation in one place. Integrates with Google Drive, Dropbox, and OneDrive for easy access. Built with encryption and role-based access controls.
              </p>
            </div>

            {/* AI Assistant */}
            <div className="bg-zinc-800 rounded-xl p-6 border border-tracer-green/20 hover:bg-zinc-700 transition-colors duration-200">
              <div className="h-12 w-12 bg-tracer-green/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-tracer-green" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                ISO-AI Assistant Portal
              </h3>
              <p className="text-gray-400">
               Your AI-powered ISO assistant. Instantly get answers about processors, integrations, and best practices. ISO-AI reads your uploaded documents to deliver smarter, faster support.
              </p>
            </div>

            {/* Secure Portal */}
            <div className="bg-zinc-800 rounded-xl p-6 border border-tracer-green/20 hover:bg-zinc-700 transition-colors duration-200">
              <div className="h-12 w-12 bg-tracer-green/10 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-tracer-green" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Secure Document Upload Portal
              </h3>
              <p className="text-gray-400">
                Enable businesses to safely and securely send documents through a protected upload interface. This portal ensures sensitive information is transmitted and received securely.
              </p>
            </div>

            {/* Pre-Applications */}
            <div className="bg-zinc-800 rounded-xl p-6 border border-tracer-green/20 hover:bg-zinc-700 transition-colors duration-200">
              <div className="h-12 w-12 bg-tracer-green/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-tracer-green" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Secure Pre-Application Portal
              </h3>
              <p className="text-gray-400">
                Allow merchants to securely and conveniently submit preliminary application information. This digital portal supports document uploads from both desktop and mobile devices, ensuring a safe and streamlined experience from the start.
              </p>
            </div>

            {/* Revenue Tracking */}
            <div className="bg-zinc-800 rounded-xl p-6 border border-tracer-green/20 hover:bg-zinc-700 transition-colors duration-200">
              <div className="h-12 w-12 bg-tracer-green/10 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-tracer-green" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                ISO-Residuals Platform
              </h3>
              <p className="text-gray-400">
                The platform that started it all. Access all your residual data in one secure and easy-to-use location. Manage complex split arrangements and gain full visibility into your earnings with confidence.
              </p>
            </div>

            {/* Compliance */}
            <div className="bg-zinc-800 rounded-xl hover:bg-zinc-700 p-6 border border-tracer-green/20">
              <div className="h-12 w-12 bg-tracer-green/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-tracer-green" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Vendor Directory
              </h3>
              <p className="text-gray-400">
                Maintain a comprehensive directory of all your payment processors, gateways, and hardware vendors. Store contact information, support details, and vendor-specific documentation in one centralized location.
              </p>
            </div>
          </div>
        </div>
      </div>

     {/* Black Background Spacer */}
    <section className="py-12 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      </div>
    </section>


      {/* Security Certifications Section */}
      <section className="py-16 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Security & Compliance
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              Your data security is our top priority. We maintain the highest standards of security and compliance.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-zinc-800 rounded-lg p-6 flex flex-col items-center ring-1 ring-inset ring-tracer-green/20 hover:bg-zinc-700 transition-colors duration-200">
              <img
                src="/CCPA.jpeg"
                alt="CCPA Compliance"
                className="h-24 w-auto object-contain mb-4"
              />
              <h3 className="text-xl font-semibold text-tracer-green mb-2">CCPA Compliance</h3>
              <p className="text-gray-400 text-center">
                Compliant with California Consumer Privacy Act standards
              </p>
            </div>

            <div className="bg-zinc-800 rounded-lg p-6 flex flex-col items-center ring-1 ring-inset ring-tracer-green/20 hover:bg-zinc-700 transition-colors duration-200">
              <img
                src="/logo-iso-27001.png"
                alt="ISO 27001 Certification"
                className="h-24 w-auto object-contain mb-4"
              />
              <h3 className="text-xl font-semibold text-tracer-green mb-2">ISO 27001 Certified</h3>
              <p className="text-gray-400 text-center">
                International standard for information security management
              </p>
            </div>

            <div className="bg-zinc-800 rounded-lg p-6 flex flex-col items-center ring-1 ring-inset ring-tracer-green/20 hover:bg-zinc-700 transition-colors duration-200">
              <img
                src="/png-clipart-computer-security-center-for-internet-security-benchmark-threat-data-analysis-miscellaneous-blue.png"
                alt="Security Benchmark"
                className="h-24 w-auto object-contain mb-4"
              />
              <h3 className="text-xl font-semibold text-tracer-green mb-2">Security Benchmark</h3>
              <p className="text-gray-400 text-center">
                Industry-leading security standards and practices
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Benefits Section with Calendar */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Choose ISOHub?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Built specifically for ISOs, our platform helps you save time,
              reduce costs, and grow your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {[
                "Centralize all processor and gateway documentation",
                "Reduce time spent searching for information",
                "Streamline merchant onboarding process",
                "We follow SOC 2-aligned best practices",
                "Track portfolio performance in real-time",
                "Access AI-powered support 24/7",
              ].map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-tracer-green flex-shrink-0" />
                  <span className="ml-3 text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="bg-zinc-800 rounded-xl p-8 border border-tracer-green/20">
              <h3 id="calender" className="text-2xl font-bold text-white mb-4">
                Schedule a Demo
              </h3>
              <p className="text-gray-400 mb-6">
                See how ISOHub can transform your operations with a personalized
                demo.
              </p>

              {/* Calendar Embed Container */}
              <div className="w-full bg-zinc-900/50 rounded-lg mb-6">
                {/* <iframe
                  src="https://api.leadconnectorhq.com/widget/booking/w81N45IZKBMP1TwyhPbW"
                  style={{
                    width: "100%",
                    height: "690px",
                    border: "none",
                    overflow: "hidden",
                  }}
                  scrolling="yes"
                  id="w81N45IZKBMP1TwyhPbW_1747062225604"
                ></iframe> */}

                <iframe
                  src="https://api.leadconnectorhq.com/widget/booking/aCS2rvE1ALcxbyGMtc1C"
                  style={{
                    width: "100%",
                    height: "690px",
                    border: "none",
                    overflow: "hidden",
                  }}
                  scrolling="yes"
                  id="aCS2rvE1ALcxbyGMtc1C_1749216117259"
                />

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Us Section */}
      <div className="py-24 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Have questions? We're here to help. Fill out the form below and
              we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-zinc-800 rounded-xl overflow-hidden shadow-2xl">
            {/* <iframe
              src="https://api.leadconnectorhq.com/widget/form/XlJsv8aFfLYN18CDgQub"
              scrolling="no"
              style={{
                width: "100%",
                height: "641px",
                border: "none",
                borderRadius: "4px",
              }}
              id="inline-XlJsv8aFfLYN18CDgQub"
              data-layout="{'id':'INLINE'}"
              data-trigger-type="alwaysShow"
              data-trigger-value=""
              data-activation-type="alwaysActivated"
              data-activation-value=""
              data-deactivation-type="neverDeactivate"
              data-deactivation-value=""
              data-form-name="Contact Us"
              data-height="700"
              data-layout-iframe-id="inline-XlJsv8aFfLYN18CDgQub"
              data-form-id="XlJsv8aFfLYN18CDgQub"
              title="Contact Us"
            /> */}




            <iframe
              src="https://api.leadconnectorhq.com/widget/form/XlJsv8aFfLYN18CDgQub"
              scrolling="no"
              style={{
                width: "100%",
                height: "641px",
                border: "none",
                borderRadius: "4px",
              }}
              id="inline-XlJsv8aFfLYN18CDgQub"
              data-layout='{"id":"INLINE"}'
              data-trigger-type="alwaysShow"
              data-trigger-value=""
              data-activation-type="alwaysActivated"
              data-activation-value=""
              data-deactivation-type="neverDeactivate"
              data-deactivation-value=""
              data-form-name="Contact Us"
              data-height="577"
              data-layout-iframe-id="inline-XlJsv8aFfLYN18CDgQub"
              data-form-id="XlJsv8aFfLYN18CDgQub"
              title="Contact Us"
            />



          </div>
        </div>
      </div>



      {/* Footer */}
      <footer className="bg-zinc-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <img src="ISOHubLOGO.png" alt="ISOHub Logo" className="h-28 w-auto" />
            {/* If you want the text ISO Hub next to logo, uncomment below and adjust styling */}
            {/* <span className="ml-2 text-xl font-bold text-white">
              ISO<span className="text-yellow-400">Hub</span>
            </span> */}
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 sm:gap-4 text-sm text-gray-400 mt-4 sm:mt-0">
            <Link to="/privacy-policy" className="hover:text-white transition-colors duration-200">
              Privacy Policy
            </Link>
            <span>
              &copy; {new Date().getFullYear()} ISOHub. All rights reserved.
            </span>
          </div>
        </div>
      </footer>

      {/* Load the form embed script */}
      <script
        src="https://link.msgsndr.com/js/form_embed.js"
        type="text/javascript"
      ></script>
    </div>
  );
}
