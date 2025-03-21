// Updated components/ui/ShareButtons.tsx
'use client';

import { useState } from 'react';
import { FaFacebook, FaTwitter, FaWhatsapp, FaEnvelope, FaLink, FaCheck, FaTiktok, FaInstagram } from 'react-icons/fa';

interface ShareButtonsProps {
  url: string;
  title: string;
  className?: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ url, title, className = '' }) => {
  const [copied, setCopied] = useState(false);
  
  // Ensure we have the full URL
  const fullUrl = url.startsWith('http') ? url : `https://uhaicentre.church${url}`;
  
  // Encode components for sharing
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  
  const shareLinks = [
    {
      name: 'Facebook',
      icon: <FaFacebook size={20} />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-[#3b5998] hover:bg-[#324b81]'
    },
    {
      name: 'Twitter',
      icon: <FaTwitter size={20} />,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'bg-[#1DA1F2] hover:bg-[#0d8ad6]'
    },
    {
      name: 'WhatsApp',
      icon: <FaWhatsapp size={20} />,
      url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      color: 'bg-[#25D366] hover:bg-[#20bd5a]'
    },
    {
      name: 'Email',
      icon: <FaEnvelope size={20} />,
      url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      color: 'bg-[#777] hover:bg-[#666]'
    }
  ];
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  return (
    <div className={`flex flex-wrap gap-2 items-center ${className}`}>
      <span className="text-gray-600 mr-1">Share:</span>
      
      {shareLinks.map(link => (
        
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${link.color} text-white p-2 rounded-full transition-colors`}
          title={`Share on ${link.name}`}
          aria-label={`Share on ${link.name}`}
        >
          {link.icon}
        </a>
      ))}
      
      <button
        onClick={copyToClipboard}
        className={`${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'} text-white p-2 rounded-full transition-colors`}
        title="Copy link"
        aria-label="Copy link"
      >
        {copied ? <FaCheck size={20} /> : <FaLink size={20} />}
      </button>
    </div>
  );
};

export default ShareButtons;