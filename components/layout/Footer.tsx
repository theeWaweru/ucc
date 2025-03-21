// Updated components/layout/Footer.tsx
import React from "react";
import Link from "next/link";
import { FaFacebook, FaYoutube, FaInstagram, FaTiktok } from "react-icons/fa";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-bold mb-4">Uhai Centre Church</h3>
            <p className="mb-2">Kiambu, Kenya</p>
            <p className="mb-2">Email: info@uhaicentre.church</p>
            <p>Phone: +254 722 282892</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-gray-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/sermons" className="hover:text-gray-300">
                  Sermons
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-gray-300">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/give" className="hover:text-gray-300">
                  Give
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/profile.php?id=100094376264606"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition"
                aria-label="Facebook"
              >
                <FaFacebook size={24} />
              </a>
              <a
                href="https://www.youtube.com/@uhaicentrechurch-kiambu9322"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition"
                aria-label="YouTube"
              >
                <FaYoutube size={24} />
              </a>
              <a
                href="https://www.instagram.com/uhaicentrechurch/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition"
                aria-label="Instagram"
              >
                <FaInstagram size={24} />
              </a>
              <a
                href="https://www.tiktok.com/@uhaicentrekiambu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition"
                aria-label="TikTok"
              >
                <FaTiktok size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p>&copy; {currentYear} Uhai Centre Church. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
