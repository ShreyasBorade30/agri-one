import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome to Agri-One",
      "signin": "Sign In",
      "signup": "Sign Up",
      "email": "Email Address",
      "password": "Password",
      "name": "Full Name",
      "role": "Role",
      "farmer": "Farmer",
      "expert": "Agriculture Expert",
      "verify_email": "Please verify your email",
      "logout": "Logout",
      "home": "Home",
      "weather_report": "Weather Report",
      "farming_recommendations": "Farming Recommendations",
      "task_scheduling": "Task Scheduling",
      "book_appointments": "Book Appointments",
      "revenue_recording": "Revenue Recording",
      "crop_details_management": "Crop Details Management",
      "labour_directory": "Labour Directory",
      "marketplace_services": "Marketplace & Services",
      "equipment_shop": "Equipment & Shop",
      "profile": "Profile",
      "logout_btn": "Logout",
      "marketplace": "Marketplace",
      "appointments": "Appointments",
      "search": "Search",
      "expert_advice": "Expert Advice",
      "notifications_title": "Notifications",
      "no_notifications": "No notifications available",
      "upcoming_appointments": "Upcoming Appointments",
      "no_appointments": "No appointments scheduled",
      "join_call": "Join Video Call",
      "enter_year": "Enter Year",
      "phone_number": "Phone Number",
      "address": "Address",
      "climate": "Climate",
      "amount_of_land": "Amount of Land",
      "region": "Region",
      "crops": "Crops",
      "other_details": "Other Details",
      "edit_profile": "Edit Profile"
    }
  },
  hi: {
    translation: {
      "welcome": "Agri-One में आपका स्वागत है",
      "signin": "साइन इन करें",
      "signup": "साइन अप करें",
      "email": "ईमेल पता",
      "password": "पासवर्ड",
      "name": "पूरा नाम",
      "role": "भूमिका",
      "farmer": "किसान",
      "expert": "कृषि विशेषज्ञ",
      "verify_email": "कृपया अपना ईमेल सत्यापित करें",
      "logout": "लॉगआउट",
      "home": "होम",
      "weather_report": "मौसम रिपोर्ट",
      "farming_recommendations": "खेती की सिफारिशें",
      "task_scheduling": "कार्य शेड्यूलिंग",
      "book_appointments": "नियुक्ति बुक करें",
      "revenue_recording": "राजस्व रिकॉर्डिंग",
      "crop_details_management": "फसल विवरण प्रबंधन",
      "labour_directory": "मजदूर निर्देशिका",
      "marketplace_services": "बाज़ार और सेवाएँ",
      "equipment_shop": "उपकरण और दुकान",
      "profile": "प्रोफ़ाइल",
      "logout_btn": "लॉगआउट",
      "marketplace": "बाज़ार",
      "appointments": "नियुक्तियाँ",
      "search": "खोजें",
      "expert_advice": "विशेषज्ञ की सलाह",
      "notifications_title": "सूचनाएं",
      "no_notifications": "कोई सूचना उपलब्ध नहीं है",
      "upcoming_appointments": "आने वाली नियुक्तियाँ",
      "no_appointments": "कोई नियुक्ति निर्धारित नहीं है",
      "join_call": "वीडियो कॉल में शामिल हों",
      "enter_year": "वर्ष दर्ज करें",
      "phone_number": "फ़ोन नंबर",
      "address": "पता",
      "climate": "जलवायु (Climate)",
      "amount_of_land": "भूमि की मात्रा",
      "region": "क्षेत्र (Region)",
      "crops": "फसलें",
      "other_details": "अन्य विवरण",
      "edit_profile": "प्रोफ़ाइल संपादित करें"
    }
  },
  mr: { // Hinglish (Hindi + English mix)
    translation: {
      "welcome": "Agri-One में आपका Welcome है",
      "signin": "Sign In करें",
      "signup": "Sign Up करें",
      "email": "Email address",
      "password": "Password",
      "name": "Full Name",
      "role": "आपका Role",
      "farmer": "Farmer (किसान)",
      "expert": "Agriculture Expert",
      "verify_email": "अपना Email verify करें",
      "logout": "Logout करें",
      "home": "Home",
      "weather_report": "Weather Report देखें",
      "farming_recommendations": "Farming Recommendations",
      "task_scheduling": "Task Scheduling",
      "book_appointments": "Appointments Book करें",
      "revenue_recording": "Revenue Recording",
      "crop_details_management": "Crop Management",
      "labour_directory": "Labour Directory",
      "marketplace_services": "Marketplace और Services",
      "equipment_shop": "Equipment और Shop",
      "profile": "आपका Profile",
      "logout_btn": "Logout",
      "marketplace": "Marketplace",
      "appointments": "Appointments",
      "search": "Search करें",
      "expert_advice": "Expert की सलाह",
      "notifications_title": "Notifications",
      "no_notifications": "कोई Notifications नहीं हैं",
      "upcoming_appointments": "Upcoming Appointments",
      "no_appointments": "कोई Appointments scheduled नहीं हैं",
      "join_call": "Video Call Join करें",
      "enter_year": "Year Enter करें",
      "phone_number": "Phone Number",
      "address": "Address",
      "climate": "Climate",
      "amount_of_land": "Land की मात्रा",
      "region": "Region",
      "crops": "Crops",
      "other_details": "बाकी Details",
      "edit_profile": "Profile Edit करें"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
