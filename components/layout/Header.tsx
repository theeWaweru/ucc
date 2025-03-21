"use client";

import Link from "next/link";
import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Uhai Center Church
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-gray-600 focus:outline-none"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-gray-900">
            About
          </Link>
          <Link href="/sermons" className="text-gray-600 hover:text-gray-900">
            Sermons
          </Link>
          <Link href="/events" className="text-gray-600 hover:text-gray-900">
            Events
          </Link>
          <Link href="/prayer" className="text-gray-600 hover:text-gray-900">
            Prayer
          </Link>
          <Link href="/give" className="text-gray-600 hover:text-gray-900">
            Give
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-gray-900">
            Contact
          </Link>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white px-4 pt-2 pb-4">
          <div className="flex flex-col space-y-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
            <Link href="/sermons" className="text-gray-600 hover:text-gray-900">
              Sermons
            </Link>
            <Link href="/events" className="text-gray-600 hover:text-gray-900">
              Events
            </Link>
            // Update components/layout/Header.tsx to include a Calendar link
            <Link
              href="/calendar"
              className="text-gray-600 hover:text-gray-900"
            >
              Calendar
            </Link>
            <Link href="/give" className="text-gray-600 hover:text-gray-900">
              Give
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
