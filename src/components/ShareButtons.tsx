'use client';

import { useState } from 'react';
import { FaTwitter, FaFacebook, FaLinkedin, FaWhatsapp, FaCopy } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="flex gap-3 items-center">
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-[#1DA1F2] text-white hover:opacity-80 transition-opacity"
        aria-label="Share on Twitter"
      >
        <FaTwitter size={18} />
      </a>
      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-[#4267B2] text-white hover:opacity-80 transition-opacity"
        aria-label="Share on Facebook"
      >
        <FaFacebook size={18} />
      </a>
      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-[#0077B5] text-white hover:opacity-80 transition-opacity"
        aria-label="Share on LinkedIn"
      >
        <FaLinkedin size={18} />
      </a>
      <a
        href={shareLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-[#25D366] text-white hover:opacity-80 transition-opacity"
        aria-label="Share on WhatsApp"
      >
        <FaWhatsapp size={18} />
      </a>
      <button
        onClick={copyToClipboard}
        className={`p-2 rounded-full ${copied ? 'bg-green-500' : 'bg-gray-600'} text-white hover:opacity-80 transition-all`}
        aria-label="Copy link"
      >
        <FaCopy size={18} />
      </button>
    </div>
  );
} 