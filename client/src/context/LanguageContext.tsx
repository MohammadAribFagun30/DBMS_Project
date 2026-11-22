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
  'IIUC Telecommunication & Networking Club': 'আইআইইউসি টেলিকমিউনিকেশন অ্যান্ড নেটওয়ার্কিং ক্লাব',

  // Departments
  'General': 'সাধারণ',
  'Computer Science & Engineering': 'কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং',
  'Electrical & Electronic Engineering': 'ইলেকট্রিক্যাল অ্যান্ড ইলেকট্রনিক ইঞ্জিনিয়ারিং',
  'Business Administration': 'বিজনেস অ্যাডমিনিস্ট্রেশন',
  'Mechanical Engineering': 'মেকানিক্যাল ইঞ্জিনিয়ারিং',

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
  'All Departments': 'সকল ডিপার্টমেন্ট',
  'All Clubs': 'সকল ক্লাব',
  'All Status': 'সকল স্ট্যাটাস',
  'Reset Filters': 'ফিল্টার রিসেট',
  'Search Keywords': 'কীওয়ার্ড অনুসন্ধান',
  'Organizing Club': 'আয়োজক ক্লাব',
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
  'Admin Console': 'অ্যাডমিন কনসোল',

  // Badges & Types
  'APPROVED': 'অনুমোদিত',
  'PENDING': 'অপেক্ষমান',
  'REJECTED': 'বাতিলকৃত',
  'COMPLETED': 'সম্পন্ন',
  'CONFIRMED': 'নিশ্চিত',
  'CANCELLED': 'বাতিলকৃত',
  'ATTENDED': 'উপস্থিত',
  'WORKSHOP': 'ওয়ার্কশপ',
  'SEMINAR': 'সেমিনার',
  'HACKATHON': 'হ্যাকাথন',
  'COMPETITION': 'প্রতিযোগিতা',
  'SOCIAL': 'সামাজিক',

  // Event Card & Common UI
  'Speaker:': 'বক্তা:',
  'Req:': 'প্রয়োজনীয়তা:',
  'registered': 'নিবন্ধিত',
  'Details': 'বিস্তারিত',
  'Registered': 'নিবন্ধিত',
  'Closed': 'বন্ধ',
  'Campus Venue': 'ক্যাম্পাস ভেন্যু',
  'Campus Club': 'ক্যাম্পাস ক্লাব',

  // Home Page
  'IIUC Central Campus Management': 'আইআইইউসি কেন্দ্রীয় ক্যাম্পাস ব্যবস্থাপনা',
  'Club Activities, Technical Workshops & Verified Passes': 'ক্লাব কার্যক্রম, টেকনিক্যাল ওয়ার্কশপ ও ভেরিফাইড পাস',
  'International Islamic University Chittagong centralized platform for official club events, workshops, digital event entry passes, verified certificates, and annual 3-factor club performance rankings.': 'আন্তর্জাতিক ইসলামী বিশ্ববিদ্যালয় চট্টগ্রাম (আইআইইউসি) ক্লাবের প্রাতিষ্ঠানিক ইভেন্ট, ওয়ার্কশপ, ডিজিটাল এন্ট্রি পাস, ভেরিফাইড সার্টিফিকেট এবং বার্ষিক ৩-ফ্যাক্টর ক্লাব পারফরম্যান্স র‍্যাংকিংয়ের কেন্দ্রীয় প্ল্যাটফর্ম।',
  'Explore All Events': 'সকল ইভেন্ট দেখুন',
  'Create New Event': 'নতুন ইভেন্ট তৈরি করুন',
  'View Club Standings': 'ক্লাব স্ট্যান্ডিংস দেখুন',
  'Sponsorships': 'স্পনসরশিপ',
  'Verified Certs': 'ভেরিফাইড সার্টিফিকেট',
  'Featured Campus Events': 'ক্যাম্পাসের বিশেষ ইভেন্টসমূহ',
  'Register online to generate your digital verification pass.': 'ডিজিটাল ভেরিফিকেশন পাস পেতে অনলাইনে রেজিস্ট্রেশন করুন।',
  'View all events': 'সব ইভেন্ট দেখুন',
  'Top Ranked Clubs (2026 Academic Year)': 'শীর্ষ র‍্যাংকপ্রাপ্ত ক্লাবসমূহ (২০২৬ শিক্ষাবর্ষ)',
  'Formula: 35% Events Weight + 35% Sponsorship Weight + 30% Student Feedback': 'সূত্র: ৩৫% ইভেন্ট ওয়েট + ৩৫% স্পনসরশিপ ওয়েট + ৩০% শিক্ষার্থী ফিডব্যাক',
  'View Full Standings': 'সম্পূর্ণ স্ট্যান্ডিংস দেখুন',
  'Rank #': 'র‍্যাংক #',
  'Score:': 'স্কোর:',
  'Events (35%)': 'ইভেন্ট (৩৫%)',
  'Sponsorship (35%)': 'স্পনসরশিপ (৩৫%)',
  'Feedback (30%)': 'ফিডব্যাক (৩০%)',
  'Standard Campus Event Procedure': 'স্ট্যান্ডার্ড ক্যাম্পাস ইভেন্ট পরিচালনা পদ্ধতি',
  'Institutional event workflow from proposal to verification.': 'প্রস্তাবনা থেকে ভেরিফিকেশন পর্যন্ত প্রাতিষ্ঠানিক ইভেন্ট কর্মপ্রক্রিয়া।',
  'Publish & Schedule': 'প্রকাশ ও সময়সূচি',
  'Official university clubs submit proposals for review by the campus administration.': 'অনুমোদিত বিশ্ববিদ্যালয় ক্লাবসমূহ ক্যাম্পাস প্রশাসনের পর্যালোচনার জন্য প্রস্তাবনা জমা দেয়।',
  'Pass Generation': 'পাস তৈরি',
  'Enrolled students register online to acquire a verified pass identifier (REG-ID).': 'নিবন্ধিত শিক্ষার্থীরা ভেরিফাইড পাস আইডি পেতে অনলাইনে রেজিস্ট্রেশন করে।',
  'Venue Attendance': 'ভেন্যু উপস্থিতি',
  'Attendance check-in desk confirms the pass, granting access and eligibility for certificates.': 'উপস্থিতি ডেস্কে পাস যাচাই করে ভেন্যুতে প্রবেশ এবং সার্টিফিকেটের যোগ্যতা নিশ্চিত করা হয়।',
  'Feedback & Ranking': 'ফিডব্যাক ও র‍্যাংকিং',
  'Attendees submit ratings, which compute directly into the official 3-factor annual club ranking.': 'অংশগ্রহণকারীরা রেটিং প্রদান করে, যা সরাসরি বার্ষিক ৩-ফ্যাক্টর ক্লাব র‍্যাংকিংয়ে যুক্ত হয়।',

  // Clubs Page
  'Institutional Standing': 'প্রাতিষ্ঠানিক অবস্থান',
  'Clubs & Performance Leaderboards': 'ক্লাব ও পারফরম্যান্স লিডারবোর্ড',
  'Recognized student organizations, performance metrics, and annual 3-factor rankings.': 'স্বীকৃত শিক্ষার্থী সংগঠনসমূহ, পারফরম্যান্স মেট্রিক্স এবং বার্ষিক ৩-ফ্যাক্টর র‍্যাংকিং।',
  'Leaderboard': 'লিডারবোর্ড',
  'Club Directory': 'ক্লাব ডিরেক্টরি',
  'Academic Year': 'শিক্ষাবর্ষ',
  'Annual Standings Table': 'বার্ষিক স্ট্যান্ডিংস টেবিল',
  'Rank Position': 'র‍্যাংক পজিশন',
  'Total Score': 'মোট স্কোর',
  'Events Score (35%)': 'ইভেন্ট স্কোর (৩৫%)',
  'Active Campus Clubs': 'সক্রিয় ক্যাম্পাস ক্লাবসমূহ',

  // Student Portal / My Activity
  'Student Activity Hub': 'স্টুডেন্ট অ্যাক্টিভিটি হাব',
  'My Passes, Feedback & Issued Certificates': 'আমার পাস, ফিডব্যাক ও ইস্যুকৃত সার্টিফিকেটসমূহ',
  'Registered Passes': 'রেজিস্টার্ড পাস',
  'Pending Feedback': 'মতামত প্রদান',
  'Verified Certificates': 'ভেরিফাইড সার্টিফিকেট',
  'No event passes found.': 'কোনো ইভেন্ট পাস পাওয়া যায়নি।',
  'View Pass': 'পাস দেখুন',
  'Give Feedback': 'ফিডব্যাক দিন',
  'Verified QR': 'ভেরিফাইড কিউআর',
  'No certificates issued yet.': 'এখনো কোনো সার্টিফিকেট ইস্যু করা হয়নি।',

  // Certificate Verification
  'Registry Validation Desk': 'রেজিস্ট্রি ভ্যালিডেশন ডেস্ক',
  'Verify Official IIUC Participation Certificate': 'অফিশিয়াল আইআইইউসি সার্টিফিকেট যাচাই করুন',
  'Enter the unique Certificate ID printed on official credentials to validate authenticity against the university cryptographic record.': 'বিশ্ববিদ্যালয়ের ক্রিপ্টোগ্রাফিক রেকর্ডের সাথে সত্যতা যাচাই করতে সার্টিফিকেটে মুদ্রিত ইউনিক আইডি প্রদান করুন।',
  'Official Credential Number': 'অফিশিয়াল ক্রেডেনশিয়াল নম্বর',
  'e.g. CERT-2026-084': 'যেমন: CERT-2026-084',
  'Validating...': 'যাচাই করা হচ্ছে...',
  'Verify Record': 'রেকর্ড যাচাই করুন',
  'Quick test sample:': 'টেস্ট স্যাম্পল:',
  'Authentic Verified Record': 'সত্যতা নিশ্চিতকৃত রেকর্ড',
  'View Certificate': 'সার্টিফিকেট দেখুন',
  'Recipient Name:': 'প্রাপকের নাম:',
  'Matric ID:': 'ম্যাট্রিক আইডি:',
  'Event / Workshop:': 'ইভেন্ট / ওয়ার্কশপ:',
  'Organizing Club:': 'আয়োজক ক্লাব:',
  'Issue Date:': 'ইস্যুর তারিখ:',
  'Certificate Verification Unsuccessful': 'সার্টিফিকেট যাচাই ব্যর্থ হয়েছে',
  'No certificate found with that credential number. Please check the ID and try again.': 'এই ক্রেডেনশিয়াল নম্বরে কোনো সার্টিফিকেট পাওয়া যায়নি। আইডি পুনরায় যাচাই করে চেষ্টা করুন।',
  'Cryptographic Hash': 'ক্রিপ্টোগ্রাফিক হ্যাশ',
  'Verifiable SHA-256 digital signature issued by campus registry.': 'ক্যাম্পাস রেজিস্ট্রি দ্বারা ইস্যুকৃত যাচাইযোগ্য SHA-256 ডিজিটাল স্বাক্ষর।',
  'Official Recognition': 'অফিশিয়াল স্বীকৃতি',
  'Recorded exclusively for attended university workshops.': 'শুধুমাত্র উপস্থিত থাকা বিশ্ববিদ্যালয়ের ওয়ার্কশপের জন্য সংরক্ষিত।',
  'Anti-Tamper Ledger': 'অ্যান্টি-ট্যাম্পার লেজার',
  'Stored permanently in the central academic database.': 'কেন্দ্রীয় একাডেমিক ডেটাবেজে স্থায়ীভাবে সংরক্ষিত।',
  'Public Certificate & Credential Verification': 'পাবলিক সার্টিফিকেট ও ক্রেডেনশিয়াল ভেরিফিকেশন',
  'Enter Certificate / Credential Number': 'সার্টিফিকেট / ক্রেডেনশিয়াল নম্বর লিখুন',
  'Verify Credential': 'ক্রেডেনশিয়াল যাচাই করুন',
  'Official IIUC Verified Credential': 'অফিশিয়াল আইআইইউসি ভেরিফাইড ক্রেডেনশিয়াল',
  'Certificate Valid & Authentic': 'সার্টিফিকেটটি বৈধ ও সঠিক'
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
    return key;
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
