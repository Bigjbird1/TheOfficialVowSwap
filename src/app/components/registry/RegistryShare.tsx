"use client";

import React, { useState } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Modal } from '@/app/components/ui/Modal';

interface RegistryShareProps {
  registryId: string;
  registryTitle: string;
  shareLink: string;
}

export default function RegistryShare({ registryId, registryTitle, shareLink }: RegistryShareProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleSocialShare = (platform: 'facebook' | 'twitter' | 'pinterest') => {
    const text = `Check out my wedding registry: ${registryTitle}`;
    let url = '';

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(text)}`;
        break;
      case 'pinterest':
        url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareLink)}&description=${encodeURIComponent(text)}`;
        break;
    }

    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <>
      <Button onClick={() => setShowShareModal(true)} variant="secondary">
        Share Registry
      </Button>

      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Your Registry"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Share Link</h3>
            <div className="flex space-x-2">
              <Input
                value={shareLink}
                readOnly
                onClick={(e: React.MouseEvent<HTMLInputElement>) => e.currentTarget.select()}
              />
              <Button onClick={handleCopyLink} variant="secondary">
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Share on Social Media</h3>
            <div className="flex space-x-4">
              <Button
                onClick={() => handleSocialShare('facebook')}
                variant="outline"
                className="flex-1"
              >
                Facebook
              </Button>
              <Button
                onClick={() => handleSocialShare('twitter')}
                variant="outline"
                className="flex-1"
              >
                Twitter
              </Button>
              <Button
                onClick={() => handleSocialShare('pinterest')}
                variant="outline"
                className="flex-1"
              >
                Pinterest
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Share via Email</h3>
            <Button
              onClick={() => {
                const subject = encodeURIComponent(`Wedding Registry: ${registryTitle}`);
                const body = encodeURIComponent(`Check out my wedding registry: ${shareLink}`);
                window.location.href = `mailto:?subject=${subject}&body=${body}`;
              }}
              variant="outline"
              className="w-full"
            >
              Send Email
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
