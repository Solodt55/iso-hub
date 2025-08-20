import React from "react";
import { Link, useLocation } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import {
  CreditCard,
} from "lucide-react";

const IsoAi: React.FC = () => {

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" reverseOrder={false} />
      {/* Header */}
      <div className="mb-8 bg-tracer-green rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-10 w-10 text-white" />
            <div>
              <h1 className="text-3xl font-bold text-white">ISO AI Portal</h1>
              <p className="text-white/80 mt-1">
               ISO AI Portal
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IsoAi;
