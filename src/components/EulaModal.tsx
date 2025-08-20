import React, { useState } from 'react';

interface EulaModalProps {
  onAgree: () => void;
  onCancel: () => void;
}

const EulaModal: React.FC<EulaModalProps> = ({ onAgree, onCancel }) => {
  const [hasConsented, setHasConsented] = useState(false);

  // Link to your actual terms and conditions document
  const termsLink = `${import.meta.env.VITE_API_URL}/privacy-policy`;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">End User License Agreement (EULA)</h2>
        </div>
        <div className="flex-grow p-6 overflow-y-auto text-gray-700 text-sm leading-relaxed">
          <p className="mb-4">
            Welcome to ISOHub. Before you proceed, please review and accept our End User License Agreement.
            This agreement governs your use of our services.
          </p>
          <p className="mb-4">
            By checking the box below and clicking "Agree and Login", you acknowledge that you have read,
            understood, and agree to be bound by the privacy policy outlined in our{' '}
            <a href={termsLink} target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:underline">
              Privacy Policy
            </a>.
          </p>
          <p className="mb-4">
            Key points of the agreement include:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-1">
            <li>Data privacy and usage policies.</li>
            <li>Acceptable use of the platform.</li>
            <li>Disclaimers and limitations of liability.</li>
            <li>Intellectual property rights.</li>
          </ul>
          <p className="mb-4">
            Failure to accept this agreement will prevent you from accessing certain features of the platform.
          </p>
          {/* You can add more detailed terms here, or simply link to a full document */}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="flex items-center text-gray-700">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-tracer-green border-tracer-green focus:ring-tracer-green focus:border-tracer-green rounded"
              checked={hasConsented}
              onChange={(e) => setHasConsented(e.target.checked)}
            />
            <span className="ml-2 text-sm">I agree to the Terms and Conditions</span>
          </label>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onAgree}
              disabled={!hasConsented}
              className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                hasConsented
                  ? 'bg-tracer-green text-white hover:bg-tracer-green/90'
                  : 'bg-tracer-green/50 text-white opacity-50 cursor-not-allowed'
              }`}
            >
              Agree and Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EulaModal;