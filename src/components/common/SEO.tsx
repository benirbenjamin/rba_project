import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = "Watch RTV Live and listen to Radio Rwanda, Magic FM, and all regional community stations live from Rwanda Broadcasting Agency (RBA).",
  canonical = "https://rba.benix.space",
  ogImage = "/logo.png",
  ogType = "website",
}) => {
  const fullTitle = title ? `${title} | RBA Rwanda` : 'RTV Rwanda Live | Rwanda Broadcasting Agency';

  useEffect(() => {
    document.title = fullTitle;

    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }

    // Update OpenGraph
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', fullTitle);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    let ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg) ogImg.setAttribute('content', ogImage);
  }, [fullTitle, description, ogImage]);

  return null;
};
