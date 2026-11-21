import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'EN' | 'BN';

interface LanguageContextType {
  language: Language;
  isBn: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const bnTranslations: Record<string, string> = {
  // Navigation & Common
  'Home': 'হোম',
  'Dashboard': 'ড্যাশবোর্ড',
  'Workspace': 'ওয়ার্কস্পেস',
  'Profile': 'প্রোফাইল',
  'Events & Workshops': 'ইভেন্ট ও ওয়ার্কশপ',
  'Clubs & Rankings': 'ক্লাব ও র‍্যাংকিং',
  'Attendance': 'উপস্থিতি',
  'Attendance Desk': 'উপস্থিতি ডেস্ক',
  'Sponsorship': 'স্পনসরশিপ',
  'Sponsorship Ledger': 'স্পনসরশিপ লেজার',
  'Audit Logs': 'অডিট লগ',
  'Security Logs': 'সিকিউরিটি লগ',
  'Sign Out': 'সাইন আউট',
  'Log Out': 'লগআউট',
  'Public Campus Portal': 'ক্যাম্পাস পোর্টাল',
  'Admin Hub': 'অ্যাডমিন হাব',
  'Verify Certificate': 'সার্টিফিকেট যাচাই',
  'My Activity': 'আমার অ্যাক্টিভিটি',
  'Overview': 'ওভারভিউ',
  'Features': 'ফিচারসমূহ',
  'How It Works': 'যেভাবে কাজ করে',
  'Notice Board': 'নোটিশ বোর্ড',
  'About IIUC': 'আইআইইউসি সম্পর্কে',
  'Login': 'লগইন',
  'Register': 'রেজিস্ট্রেশন',
  'Sign up': 'সাইন আপ',
  'Sign in': 'সাইন ইন',
  'Search': 'অনুসন্ধান',
  'Filter': 'ফিল্টার',
  'Actions': 'অ্যাকশন',
  'Status': 'স্ট্যাটাস',
  'Save': 'সংরক্ষণ',
  'Cancel': 'বাতিল',
  'Close': 'বন্ধ করুন',
  'Delete': 'মুছুন',
  'Edit': 'সম্পাদনা',
  'View': 'দেখুন',
  'All': 'সকল',
  'Pending': 'অপেক্ষমান',
  'Approved': 'অনুমোদিত',
  'Rejected': 'বাতিলকৃত',
  'Completed': 'সম্পন্ন',
  'Refresh': 'রিফ্রেশ',

  // Admin Dashboard Overview & Headers
  'Admin Dashboard': 'অ্যাডমিন ড্যাশবোর্ড',
  'Monitor platform activity and manage your workspace.': 'প্ল্যাটফর্মের কার্যক্রম পর্যবেক্ষণ ও আপনার ওয়ার্কস্পেস পরিচালনা করুন।',
  'Campus Events': 'ক্যাম্পাস ইভেন্ট',
  'Issued Passes': 'ইস্যুকৃত পাস',
  'Raised Funds': 'সংগৃহীত তহবিল',
  'Pending Approvals': 'অপেক্ষমান অনুমোদন',
  'Pending Event Approvals Queue': 'অপেক্ষমান ইভেন্ট অনুমোদন কিউ',
  'View all': 'সবগুলো দেখুন',
  'All events moderated!': 'সকল ইভেন্ট মডারেট সম্পন্ন!',
  'No proposals currently awaiting review.': 'পর্যালোচনার জন্য কোনো প্রস্তাব বাকি নেই।',
  'Platform Audit Activity': 'প্ল্যাটফর্ম অডিট অ্যাক্টিভিটি',
  'View full log': 'সম্পূর্ণ লগ দেখুন',
  'Events & Workshops Console': 'ইভেন্ট ও ওয়ার্কশপ কনসোল',
  'Manage, moderate, and monitor campus events and hands-on workshops.': 'ক্যাম্পাস ইভেন্ট ও হ্যান্ডস-অন ওয়ার্কশপসমূহ পরিচালনা, মডারেট ও পর্যবেক্ষণ করুন।',
  'Total Events': 'মোট ইভেন্ট',
  'Workshops': 'ওয়ার্কশপ',
  'Search by event title or club...': 'ইভেন্টের নাম বা ক্লাব দিয়ে খুঁজুন...',
  'No events matching criteria.': 'কোনো ইভেন্ট পাওয়া যায়নি।',
  'Approve': 'অনুমোদন',
  'Reject': 'বাতিল',
  'Complete': 'সম্পন্ন',

  // Venue & Attendance
  'Venue Check-In & Certificate Issue': 'ভেন্যু চেক-ইন ও সার্টিফিকেট প্রদান',
  'Select event to mark attendee passes and unlock certificates.': 'অ্যাটেন্ডি পাস চিহ্নিত করতে ও সার্টিফিকেট আনলক করতে ইভেন্ট নির্বাচন করুন।',
  'Issue Certs': 'সার্টিফিকেট দিন',
  'Selected Event:': 'নির্বাচিত ইভেন্ট:',
  'Total Registered:': 'মোট নিবন্ধিত:',

  // Sponsorship Ledger
  'Record Corporate Sponsorship': 'কর্পোরেট স্পনসরশিপ রেকর্ড করুন',
  'Target Event': 'টার্গেট ইভেন্ট',
  'Select Event...': 'ইভেন্ট নির্বাচন করুন...',
  'Sponsor Organization': 'স্পনসর প্রতিষ্ঠান',
  'Select Sponsor...': 'স্পনসর নির্বাচন করুন...',
  'Amount Funded ($)': 'অর্থায়নের পরিমাণ ($)',
  'Tier': 'টিয়ার',
  'Record Funds to Ledger': 'লেজারে ফান্ড রেকর্ড করুন',
  'Platinum Tier': 'প্লাটিনাম টিয়ার',
  'Gold Tier': 'গোল্ড টিয়ার',
  'Silver Tier': 'সিলভার টিয়ার',
  'Bronze Tier': 'ব্রোঞ্জ টিয়ার',

  // Clubs & Rankings
  'IIUC 3-Factor Normalization Algorithm': 'আইআইইউসি ৩-ফ্যাক্টর নরমালাইজেশন অ্যালগরিদম',
  'Ranking Formula': 'সূত্র: ৩৫% ইভেন্ট ওয়েট + ৩৫% স্পনসরশিপ ওয়েট + ৩০% শিক্ষার্থী মতামত।',
  'Year 2026': '২০২৬ সাল',
  'Year 2025': '২০২৫ সাল',
  'Generate Rankings': 'র‍্যাংকিং তৈরি করুন',
  'Computing...': 'হিসাব হচ্ছে...',
  'Rank': 'র‍্যাংক',
  'Club Name': 'ক্লাবের নাম',
  'Events Score': 'ইভেন্ট স্কোর',
  'Final Score': 'চূড়ান্ত স্কোর',
  'Feedback': 'ফিডব্যাক',
  'Registered Campus Clubs Directory': 'নিবন্ধিত ক্যাম্পাস ক্লাব ডিরেক্টরি',
  'Clubs Registered': 'ক্লাব নিবন্ধিত',
  'No description provided.': 'কোনো বিবরণ দেওয়া হয়নি।',

  // Club Names
  'IIUC Computer Club (IIUCCC)': 'আইআইইউসি কম্পিউটার ক্লাব (IIUCCC)',
  'IIUC AI & Data Science Society': 'আইআইইউসি এআই অ্যান্ড ডেটা সায়েন্স সোসাইটি',
  'IIUC Robotics & Automation Club': 'আইআইইউসি রোবোটিক্স অ্যান্ড অটোমেশন ক্লাব',
  'IIUC Business & Leadership Forum': 'আইআইইউসি বিজনেস অ্যান্ড লিডারশিপ ফোরাম',

  // Audit Logs & Security
  'Platform Security & Audit Trail': 'প্ল্যাটফর্ম সিকিউরিটি ও অডিট ট্রেইল',
  'Real-time Immutable Security Logs': 'রিয়েল-টাইম সিকিউরিটি অডিট লগ',

  // Profile Tab
  'System Administrator': 'সিস্টেম অ্যাডমিনিস্ট্রেটর',
  'Role: ADMIN': 'রোল: অ্যাডমিন',
  'Email Address': 'ইমেইল ঠিকানা',
  'Matric / Admin ID': 'অ্যাডমিন আইডি',
  'Department': 'ডিপার্টমেন্ট',

  // Login Page
  'Email': 'ইমেইল',
  'Password': 'পাসওয়ার্ড',
  'Enter your password': 'আপনার পাসওয়ার্ড লিখুন',
  'Remember me': 'আমাকে মনে রাখুন',
  'Forgot password?': 'পাসওয়ার্ড ভুলে গেছেন?',
  'Or continue with': 'অথবা চালিয়ে যান',
  'Google': 'গুগল',
  "Don't have an account?": 'কোনো অ্যাকাউন্ট নেই?',
  'Quick Test Accounts': 'কুইক টেস্ট অ্যাকাউন্টসমূহ',

  // Register Page
  'Student Sign Up': 'স্টুডেন্ট সাইন আপ',
  'Register your International Islamic University Chittagong profile to get event passes and certificates.': 'ইভেন্ট পাস ও সার্টিফিকেট পেতে আপনার আইআইইউসি প্রোফাইল রেজিস্টার করুন।',
  'IIUC Student ID *': 'আইআইইউসি স্টুডেন্ট আইডি *',
  'Full Name *': 'পুরো নাম *',
  'IIUC Institutional Email *': 'আইআইইউসি প্রাতিষ্ঠানিক ইমেইল *',
  'Create Password *': 'পাসওয়ার্ড তৈরি করুন *',
  'Academic Department': 'একাডেমিক ডিপার্টমেন্ট',
  'Select Department': 'ডিপার্টমেন্ট নির্বাচন করুন',
  'Create Student Account': 'স্টুডেন্ট অ্যাকাউন্ট তৈরি করুন',
  'Already have an account?': 'ইতিমধ্যে অ্যাকাউন্ট আছে?',

  // Welcome Page
  'Welcome to': 'স্বাগতম',
  'Explore our vibrant student clubs, technical workshops, campus events, and verified digital certificates — all in one centralized university platform.': 'আমাদের সক্রিয় স্টুডেন্ট ক্লাব, টেকনিক্যাল ওয়ার্কশপ, ক্যাম্পাস ইভেন্ট এবং ভেরিফাইড ডিজিটাল সার্টিফিকেট এক্সপ্লোর করুন — বিশ্ববিদ্যালয়ের একটি কেন্দ্রীয় প্ল্যাটফর্মে।',
  'Get Started': 'শুরু করুন',
  'Student Clubs': 'স্টুডেন্ট ক্লাব',
  'Verified QR Certs': 'ভেরিফাইড কিউআর সার্টিফিকেট',
  'Platform Features': 'প্ল্যাটফর্মের ফিচারসমূহ',
  'Everything you need for campus life': 'ক্যাম্পাস জীবনের প্রয়োজনীয় সবকিছু',
  'International Islamic University Chittagong · Campus Portal': 'আন্তর্জাতিক ইসলামী বিশ্ববিদ্যালয় চট্টগ্রাম · ক্যাম্পাস পোর্টাল',

  // Footer
  'Portal Navigation': 'পোর্টাল নেভিগেশন',
  'Browse Events & Workshops': 'ইভেন্ট ও ওয়ার্কশপ ব্রাউজ করুন',
  'Clubs & Annual Leaderboard': 'ক্লাব ও বার্ষিক লিডারবোর্ড',
  'Public Certificate Verification': 'সার্টিফিকেট ভেরিফিকেশন',
  'My Passes & Feedback': 'আমার পাস ও ফিডব্যাক',
  'System Specs': 'সিস্টেম স্পেক্স',
  'Admin Console': 'অ্যাডমিন কনসোল'
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('clubverse_language') as Language | null;
    return saved === 'BN' ? 'BN' : 'EN';
  });

  useEffect(() => {
    localStorage.setItem('clubverse_language', language);
    document.documentElement.lang = language === 'BN' ? 'bn' : 'en';
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'EN' ? 'BN' : 'EN'));
  };

  const t = (key: string, fallback?: string): string => {
    if (language === 'BN') {
      return bnTranslations[key] || fallback || key;
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        isBn: language === 'BN',
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
