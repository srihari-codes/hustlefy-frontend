import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-orange-50/80 backdrop-blur-sm border-t border-orange-200/50 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-gray-600">
          © srihari-codes 2025 •{" "}
          {
            <a
              href="https://github.com/srihari-codes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:text-orange-800 transition-colors duration-200 font-medium"
            >
              Dev Profile
            </a>
          }
        </div>
      </div>
    </footer>
  );
};

export default Footer;
