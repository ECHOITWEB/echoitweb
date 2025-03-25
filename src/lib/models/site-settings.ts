// Site settings model for admin panel

export interface SiteSettings {
  logoUrl: string;
  ogImageUrl: string;
  companyBrochureUrl: string;
  faviconUrl?: string;
}

// Default site settings
let siteSettings: SiteSettings = {
  logoUrl: 'https://ext.same-assets.com/1397033195/831049508.png',
  ogImageUrl: 'https://ext.same-assets.com/1397033195/831049508.png',
  companyBrochureUrl: '',
  faviconUrl: '',
};

// Get site settings
export function getSiteSettings(): SiteSettings {
  return { ...siteSettings };
}

// Update site settings
export function updateSiteSettings(newSettings: Partial<SiteSettings>): SiteSettings {
  siteSettings = {
    ...siteSettings,
    ...newSettings,
  };
  return { ...siteSettings };
}

// Update logo URL
export function updateLogoUrl(url: string): SiteSettings {
  return updateSiteSettings({ logoUrl: url });
}

// Update OG image URL
export function updateOgImageUrl(url: string): SiteSettings {
  return updateSiteSettings({ ogImageUrl: url });
}

// Update company brochure URL
export function updateCompanyBrochureUrl(url: string): SiteSettings {
  return updateSiteSettings({ companyBrochureUrl: url });
}

// Update favicon URL
export function updateFaviconUrl(url: string): SiteSettings {
  return updateSiteSettings({ faviconUrl: url });
}
