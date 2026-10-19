import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  RotateCcw, 
  MapPin, 
  Heart, 
  PlusCircle, 
  Info,
  Calendar,
  Clock,
  JapaneseYen,
  ShieldCheck
} from 'lucide-react';
import type { Destination, Region, Season, Category } from '../types';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  matchedDestinations?: Destination[];
  suggestions?: string[];
  isOutOfScope?: boolean;
}

interface AIChatbotProps {
  destinations: Destination[];
  onSelectDestination?: (dest: Destination) => void;
  onAddToItinerary?: (dest: Destination) => void;
  onToggleWishlist?: (dest: Destination) => void;
  wishlist?: Destination[];
  isAuthenticated?: boolean;
  onOpenLoginModal?: () => void;
}

const QUICK_SUGGESTIONS = [
  '🌸 ในเว็บมีที่เที่ยวชมซากุระที่ไหนบ้าง?',
  '🍁 แนะนำที่เที่ยวชมใบไม้เปลี่ยนสีในระบบ',
  '⛩️ วัดและศาลเจ้าที่มีในเว็บไซต์',
  '💰 มีสถานที่เข้าชมฟรีที่ไหนบ้างในเว็บ?',
  '🗼 มีสถานที่เที่ยวในโตเกียวหรือคันโตไหม?',
  '🍵 แนะนำสถานที่ในเกียวโตหรือคันไซ',
  '💡 เว็บไซต์นี้ใช้งานยังไง มีฟีเจอร์อะไรบ้าง?',
];

export function AIChatbot({
  destinations,
  onSelectDestination,
  onAddToItinerary,
  onToggleWishlist,
  wishlist = [],
  isAuthenticated = false,
  onOpenLoginModal,
}: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: `สวัสดีครับ! ผมคือ **Japan Tabi Assistant** 🎌✨\nผู้ช่วยตอบคำถามเฉพาะข้อมูลภายในเว็บไซต์ **Japan Tabi Discovery & Itinerary Planner** เท่านั้นครับ\n\n📌 **สิ่งที่คุณสามารถสอบถามได้:**\n• ข้อมูลสถานที่ท่องเที่ยวทั้ง **${destinations.length} แห่ง** ในฐานข้อมูลเว็บไซต์ (ค่าเข้า, เวลาเปิด-ปิด, สถานีใกล้เคียง, ฤดูกาลแนะนำ, เกร็ดท่องเที่ยว)\n• การค้นหาสถานที่ตามภูมิภาค (คันโต, คันไซ, ฮอกไกโด, คิวชู ฯลฯ) หรือหมวดหมู่\n• แนะนำสถานที่เข้าฟรี หรือสถานที่ตามฤดูที่มีบันทึกไว้ในเว็บ\n• วิธีการใช้งานระบบเว็บ (การจัดทริป, บันทึกรายการโปรด, เข้าสู่ระบบ, การจัดการข้อมูล)`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        '🌸 ที่เที่ยวใบไม้ผลิในเว็บ',
        '⛩️ วัดและศาลเจ้าที่มีในเว็บ',
        '💰 สถานที่เข้าชมฟรีในระบบ',
        '💡 วิธีใช้งานระบบจัดทริป',
      ],
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Strict domain-specific answer generator: ONLY answers based on website data & features
  const generateStrictWebResponse = (userQuery: string): { 
    text: string; 
    matched: Destination[]; 
    suggestions: string[];
    isOutOfScope?: boolean;
  } => {
    const rawQuery = userQuery.trim();
    const query = rawQuery.toLowerCase();

    // 1. Detect completely unrelated questions (Off-topic check)
    const outOfScopePatterns = [
      'สภาพอากาศวันนี้', 'พยากรณ์อากาศ', 'หุ้น', 'บิตคอยน์', 'crypto', 'การเมือง', 'เลือกตั้ง',
      'เขียนโค้ด', 'python', 'javascript', 'สูตรคณิต', 'เพลง', 'ดูดวง', 'ฟุตบอล', 'บอลโลก',
      'แปลภาษา', 'หนัง', 'ซีรีส์', 'ยุโรป', 'อเมริกา', 'เกาหลี', 'ไทยเที่ยว', 'สายการบินไหนถูกสุด',
      'จองตั๋วเครื่องบิน', 'วีซ่าผ่านยังไง', 'ซิมการ์ด', 'แลกเงินเรทไหน'
    ];

    const isExplicitlyOutOfScope = outOfScopePatterns.some((pattern) => query.includes(pattern));
    if (isExplicitlyOutOfScope) {
      return {
        text: `⚠️ **ขออภัยครับ:** ผมเป็นผู้ช่วยที่ตอบเฉพาะ **ข้อมูลภายในเว็บไซต์ Japan Tabi** เท่านั้นครับ (เช่น ข้อมูลสถานที่ท่องเที่ยว ${destinations.length} แห่ง, ค่าเข้าชม, เวลาเปิด-ปิด, สถานีรถไฟใกล้เคียง และวิธีใช้งานฟีเจอร์ในเว็บ)\n\nกรุณาสอบถามเกี่ยวกับสถานที่ท่องเที่ยวหรือฟังก์ชันการใช้งานที่มีบนเว็บไซต์ของเรานะครับ 😊`,
        matched: [],
        suggestions: [
          '🌸 ดูสถานที่ท่องเที่ยวในเว็บ',
          '💰 สถานที่เที่ยวที่เข้าชมฟรี',
          '🗺️ วิธีจัดแผนท่องเที่ยวในเว็บ',
        ],
        isOutOfScope: true,
      };
    }

    // 2. Questions about Website Features & How to use the Web App
    if (
      query.includes('วิธีใช้') || query.includes('ใช้งานยังไง') || query.includes('ฟีเจอร์') ||
      query.includes('จัดแผน') || query.includes('แพลนเนอร์') || query.includes('itinerary') ||
      query.includes('รายการโปรด') || query.includes('wishlist') || query.includes('เข้าสู่ระบบ') ||
      query.includes('สมัครสมาชิก') || query.includes('เว็บนี้ทำอะไรได้') || query.includes('ระบบ')
    ) {
      let webFeatureInfo = `🌐 **คู่มือการใช้งานเว็บไซต์ Japan Tabi:**\n\n`;
      webFeatureInfo += `1. **ค้นพบ (Discover):** ค้นหาและคัดกรองสถานที่ท่องเที่ยวในญี่ปุ่นจากฐานข้อมูล ${destinations.length} แห่ง กรองตามภูมิภาค (Region), หมวดหมู่ (Category), และฤดูกาล (Season)\n`;
      webFeatureInfo += `2. **จัดแผนทริป (Itinerary Planner):** เพิ่มสถานที่ลงในแผนทริปแต่ละวัน (Day 1, 2, 3...) จัดลำดับและระบุเวลาเยี่ยมชม\n`;
      webFeatureInfo += `3. **รายการโปรด (Wishlist):** กดไอคอนหัวใจ ❤️ เพื่อบันทึกสถานที่ที่สนใจเก็บไว้ดูภายหลัง\n`;
      webFeatureInfo += `4. **ระบบสมาชิก (Auth & OAuth):** เข้าสู่ระบบผ่าน Google หรืออีเมล เพื่อปลดล็อกการจัดแผนทริปและบันทึกรายการโปรด\n`;
      webFeatureInfo += `5. **ระบบผู้ดูแล (Admin Console):** สำหรับ Super Admin และ Admin ในการเพิ่ม/แก้ไข/ลบสถานที่และจัดการประกาศ`;

      return {
        text: webFeatureInfo,
        matched: [],
        suggestions: [
          '⛩️ แสดงสถานที่ทั้งหมดในเว็บ',
          '💰 แนะนำสถานที่เข้าชมฟรี',
          '🌸 ที่เที่ยวตามฤดูในเว็บ',
        ],
      };
    }

    // 3. Questions about Seasons within website destinations
    if (query.includes('ซากุระ') || query.includes('ใบไม้ผลิ') || query.includes('spring')) {
      const matched = destinations.filter((d) => d.recommendedSeasons?.includes('spring'));
      return {
        text: `🌸 **สถานที่ท่องเที่ยวแนะนำสำหรับฤดูใบไม้ผลิ (ซากุระ) ที่มีในฐานข้อมูลเว็บไซต์ (${matched.length} แห่ง):**\nระบบได้รวบรวมสถานที่ที่มีป้ายแนะนำฤดูใบไม้ผลิไว้ คุณสามารถกดดูรายละเอียดหรือเพิ่มเข้าแผนทริปได้เลยครับ`,
        matched: matched.slice(0, 5),
        suggestions: ['🍁 ที่เที่ยวฤดูใบไม้ร่วงในเว็บ', '❄️ ที่เที่ยวฤดูหนาวในเว็บ', '💰 สถานที่เข้าฟรี'],
      };
    }

    if (query.includes('ใบไม้เปลี่ยนสี') || query.includes('ใบไม้แดง') || query.includes('ฤดูใบไม้ร่วง') || query.includes('autumn') || query.includes('fall')) {
      const matched = destinations.filter((d) => d.recommendedSeasons?.includes('autumn'));
      return {
        text: `🍁 **สถานที่ชมใบไม้เปลี่ยนสีที่มีบันทึกในเว็บไซต์ (${matched.length} แห่ง):**\nสถานที่ด้านล่างนี้ถูกแนะนำเป็นพิเศษสำหรับช่วงฤดูใบไม้ร่วงในระบบของเราครับ`,
        matched: matched.slice(0, 5),
        suggestions: ['🌸 ที่เที่ยวฤดูใบไม้ผลิในเว็บ', '❄️ ที่เที่ยวฤดูหนาวในเว็บ', '🗼 ที่เที่ยวโตเกียวในเว็บ'],
      };
    }

    if (query.includes('หิมะ') || query.includes('หนาว') || query.includes('winter') || query.includes('สกี')) {
      const matched = destinations.filter((d) => d.recommendedSeasons?.includes('winter'));
      return {
        text: `❄️ **สถานที่ท่องเที่ยวฤดูหนาวที่มีในเว็บไซต์ (${matched.length} แห่ง):**\nจุดหมายปลายทางที่แนะนำสำหรับหน้าหนาวตามฐานข้อมูลของเว็บเรา:`,
        matched: matched.slice(0, 5),
        suggestions: ['♨️ ออนเซ็นในเว็บ', '🌸 ที่เที่ยวฤดูใบไม้ผลิในเว็บ', '🍣 ที่กินในเว็บ'],
      };
    }

    if (query.includes('หน้าร้อน') || query.includes('ฤดูร้อน') || query.includes('summer')) {
      const matched = destinations.filter((d) => d.recommendedSeasons?.includes('summer'));
      return {
        text: `☀️ **สถานที่ท่องเที่ยวฤดูร้อนที่มีในเว็บไซต์ (${matched.length} แห่ง):**\nสถานที่ที่แนะนำสำหรับเที่ยวช่วงฤดูร้อนในฐานข้อมูลเว็บไซต์:`,
        matched: matched.slice(0, 5),
        suggestions: ['🌸 ที่เที่ยวฤดูใบไม้ผลิในเว็บ', '🍁 ที่เที่ยวฤดูใบไม้ร่วงในเว็บ', '💰 สถานที่เข้าฟรี'],
      };
    }

    // 4. Questions about Free admission / Pricing in website
    if (query.includes('ฟรี') || query.includes('ค่าเข้า') || query.includes('ราคา') || query.includes('เยน') || query.includes('admission') || query.includes('fee')) {
      const freeDests = destinations.filter((d) => d.admissionFeeYen === 0);
      return {
        text: `💰 **สถานที่ท่องเที่ยวที่เข้าชมฟรี (0 เยน) ในเว็บไซต์ (${freeDests.length} แห่ง):**\nตามข้อมูลค่าเข้าชมที่บันทึกในฐานข้อมูลเว็บเรา มีสถานที่เข้าชมฟรีดังนี้ครับ:`,
        matched: freeDests.slice(0, 5),
        suggestions: ['⛩️ วัดและศาลเจ้าในเว็บ', '🗼 ที่เที่ยวคันโตในเว็บ', '🍵 ที่เที่ยวคันไซในเว็บ'],
      };
    }

    // 5. Questions by Region (Hokkaido, Tohoku, Kanto, Chubu, Kansai, Chugoku, Shikoku, Kyushu, Okinawa)
    const regionMap: Record<string, Region> = {
      'ฮอกไกโด': 'Hokkaido',
      'hokkaido': 'Hokkaido',
      'โทโฮคุ': 'Tohoku',
      'tohoku': 'Tohoku',
      'คันโต': 'Kanto',
      'kanto': 'Kanto',
      'โตเกียว': 'Kanto',
      'tokyo': 'Kanto',
      'ชูบุ': 'Chubu',
      'chubu': 'Chubu',
      'ฟูจิ': 'Chubu',
      'คันไซ': 'Kansai',
      'kansai': 'Kansai',
      'โอซาก้า': 'Kansai',
      'osaka': 'Kansai',
      'เกียวโต': 'Kansai',
      'kyoto': 'Kansai',
      'นารา': 'Kansai',
      'ชูโกกุ': 'Chugoku',
      'chugoku': 'Chugoku',
      'ฮิโรชิมา': 'Chugoku',
      'hiroshima': 'Chugoku',
      'ชิโกกุ': 'Shikoku',
      'shikoku': 'Shikoku',
      'คิวชู': 'Kyushu',
      'kyushu': 'Kyushu',
      'ฟุกุโอกะ': 'Kyushu',
      'โอกินาวา': 'Okinawa',
      'โอกินาว่า': 'Okinawa',
      'okinawa': 'Okinawa',
    };

    for (const [key, reg] of Object.entries(regionMap)) {
      if (query.includes(key)) {
        const matched = destinations.filter((d) => d.region === reg);
        return {
          text: `📍 **สถานที่ท่องเที่ยวภูมิภาค ${reg} ที่มีในเว็บไซต์ (${matched.length} แห่ง):**\nข้อมูลสถานที่ที่ลงทะเบียนไว้ในระบบ:`,
          matched: matched,
          suggestions: ['🌸 ที่เที่ยวฤดูใบไม้ผลิ', '💰 สถานที่เข้าฟรี', '💡 วิธีจัดแผนทริป'],
        };
      }
    }

    // 6. Questions by Category (temple, nature, city, food, onsen, history, themepark)
    if (query.includes('วัด') || query.includes('ศาลเจ้า') || query.includes('temple') || query.includes('shrine')) {
      const matched = destinations.filter((d) => d.category === 'temple');
      return {
        text: `⛩️ **วัดและศาลเจ้าที่มีในระบบเว็บไซต์ (${matched.length} แห่ง):**\nสถานที่หมวดหมู่วัด/ศาลเจ้าที่บันทึกไว้ในฐานข้อมูลเว็บเรา:`,
        matched: matched,
        suggestions: ['💰 สถานที่เข้าชมฟรี', '🌸 ที่เที่ยวฤดูใบไม้ผลิ', '🗼 ที่เที่ยวคันโต'],
      };
    }

    if (query.includes('ธรรมชาติ') || query.includes('วิว') || query.includes('ภูเขา') || query.includes('ทะเลสาบ') || query.includes('nature')) {
      const matched = destinations.filter((d) => d.category === 'nature');
      return {
        text: `⛰️ **สถานที่ท่องเที่ยวเชิงธรรมชาติและวิวสวยในระบบ (${matched.length} แห่ง):**`,
        matched: matched,
        suggestions: ['🍁 จุดชมใบไม้เปลี่ยนสี', '❄️ ที่เที่ยวหน้าหนาว', '🍵 ที่เที่ยวคันไซ'],
      };
    }

    if (query.includes('อาหาร') || query.includes('กิน') || query.includes('ตลาด') || query.includes('food') || query.includes('ซูชิ') || query.includes('ราเมน')) {
      const matched = destinations.filter((d) => d.category === 'food' || d.descriptionTh.includes('อาหาร') || d.tipsTh?.includes('กิน'));
      return {
        text: `🍣 **แหล่งของกินและอาหารที่มีในระบบเว็บไซต์ (${matched.length} แห่ง):**`,
        matched: matched,
        suggestions: ['🗼 ที่เที่ยวโตเกียว', '⛩️ ที่เที่ยวคันไซ', '💰 สถานที่เข้าฟรี'],
      };
    }

    if (query.includes('ออนเซ็น') || query.includes('onsen') || query.includes('น้ำพุร้อน')) {
      const matched = destinations.filter((d) => d.category === 'onsen' || d.descriptionTh.includes('ออนเซ็น'));
      return {
        text: `♨️ **สถานที่หมวดออนเซ็นและการผ่อนคลายในระบบ (${matched.length} แห่ง):**`,
        matched: matched,
        suggestions: ['❄️ ที่เที่ยวหน้าหนาว', '⛰️ สถานที่ธรรมชาติ', '💡 วิธีจัดทริป'],
      };
    }

    if (query.includes('ปราสาท') || query.includes('ประวัติศาสตร์') || query.includes('castle') || query.includes('history')) {
      const matched = destinations.filter((d) => d.category === 'history');
      return {
        text: `🏯 **ปราสาทและแหล่งประวัติศาสตร์ที่มีในระบบ (${matched.length} แห่ง):**`,
        matched: matched,
        suggestions: ['⛩️ วัดและศาลเจ้า', '💰 สถานที่เข้าฟรี', '🌸 ที่เที่ยวใบไม้ผลิ'],
      };
    }

    if (query.includes('ธีมปาร์ค') || query.includes('สวนสนุก') || query.includes('อนิเมะ') || query.includes('themepark')) {
      const matched = destinations.filter((d) => d.category === 'themepark');
      return {
        text: `🎡 **ธีมปาร์คและอนิเมะในระบบ (${matched.length} แห่ง):**`,
        matched: matched,
        suggestions: ['🗼 ที่เที่ยวโตเกียว/คันโต', '🍵 ที่เที่ยวโอซาก้า/คันไซ', '💡 วิธีจัดทริป'],
      };
    }

    // 7. Direct keyword search inside destinations catalog (names, description, station, tips, prefecture)
    const exactMatches = destinations.filter((d) => 
      d.nameTh.toLowerCase().includes(query) ||
      d.nameEn.toLowerCase().includes(query) ||
      d.nameJa.includes(rawQuery) ||
      d.descriptionTh.toLowerCase().includes(query) ||
      d.prefecture.toLowerCase().includes(query) ||
      d.nearestStation.toLowerCase().includes(query) ||
      (d.tipsTh && d.tipsTh.toLowerCase().includes(query))
    );

    if (exactMatches.length > 0) {
      const first = exactMatches[0];
      let detailedText = `🔎 **พบข้อมูลในเว็บไซต์ตรงกับ "${rawQuery}" (${exactMatches.length} แห่ง):**\n\n`;
      if (exactMatches.length === 1) {
        detailedText += `📌 **${first.nameTh} (${first.nameEn})**\n`;
        detailedText += `• **ภูมิภาค:** ${first.region} (${first.prefecture})\n`;
        detailedText += `• **สถานีใกล้เคียง:** ${first.nearestStation}\n`;
        detailedText += `• **ค่าเข้าชม:** ${first.admissionFeeYen === 0 ? 'เข้าฟรี (0 เยน)' : `${first.admissionFeeYen.toLocaleString()} เยน`}\n`;
        detailedText += `• **เวลาทำการ:** ${first.operatingHours.openTime} - ${first.operatingHours.closeTime} ${first.operatingHours.closedNote ? `(${first.operatingHours.closedNote})` : ''}\n`;
        if (first.tipsTh) {
          detailedText += `• **เกร็ดแนะนำ:** ${first.tipsTh}\n`;
        }
      }
      return {
        text: detailedText,
        matched: exactMatches.slice(0, 4),
        suggestions: ['📍 ดูรายละเอียดในเว็บ', '📅 เพิ่มเข้าแผนทริป', '💰 แนะนำที่เข้าฟรี'],
      };
    }

    // 8. If nothing matches the website database
    return {
      text: `⚠️ **ไม่พบข้อมูลที่ตรงกับ "${rawQuery}" ในฐานข้อมูลเว็บไซต์ Japan Tabi ครับ**\n\nระบบของเราบันทึกข้อมูลสถานที่ท่องเที่ยวไว้ทั้งหมด **${destinations.length} แห่ง** ในญี่ปุ่น คุณสามารถ:\n1. ตรวจสอบชื่อสถานที่ หรือค้นหาตามภูมิภาค เช่น โตเกียว, โอซาก้า, เกียวโต, ฮอกไกโด, ฟูจิ\n2. ค้นหาตามหมวดหมู่ เช่น วัด, ศาลเจ้า, ของกิน, ธรรมชาติ, ออนเซ็น, ปราสาท\n3. ค้นหาสถานที่เข้าฟรี หรือค้นหาตามฤดูกาล (ซากุระ, ใบไม้แดง, หิมะ)\n4. สอบถามวิธีการใช้งานเว็บไซต์`,
      matched: [],
      suggestions: [
        '⛩️ วัดและศาลเจ้าในเว็บ',
        '🌸 ที่เที่ยวซากุระในเว็บ',
        '💰 สถานที่เข้าชมฟรีในเว็บ',
        '💡 วิธีใช้งานระบบจัดทริป',
      ],
      isOutOfScope: true,
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate smart thinking delay
    setTimeout(() => {
      const response = generateStrictWebResponse(query);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedDestinations: response.matched,
        suggestions: response.suggestions,
        isOutOfScope: response.isOutOfScope,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-msg',
        sender: 'ai',
        text: `เริ่มต้นบทสนทนาใหม่แล้วครับ! 🎌✨\nผมพร้อมให้ข้อมูลเฉพาะสถานที่ท่องเที่ยวทั้ง **${destinations.length} แห่ง** และฟังก์ชันการใช้งานภายในเว็บไซต์ Japan Tabi ครับ`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          '🌸 ที่เที่ยวใบไม้ผลิในเว็บ',
          '⛩️ วัดและศาลเจ้าที่มีในเว็บ',
          '💰 สถานที่เข้าชมฟรีในระบบ',
          '💡 วิธีใช้งานระบบจัดทริป',
        ],
      },
    ]);
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 px-4 py-3.5 text-white shadow-xl shadow-rose-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-rose-500/35 cursor-pointer focus:outline-none"
            aria-label="Open AI Travel Chatbot"
          >
            <div className="relative flex items-center justify-center">
              <Bot className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
              </span>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="block text-xs font-bold leading-tight tracking-wide">Japan Tabi AI</span>
                <span className="inline-flex items-center rounded-sm bg-rose-700/60 px-1 text-[9px] font-semibold text-rose-100">
                  Web Only
                </span>
              </div>
              <span className="block text-[10px] text-rose-100 font-medium">ถามข้อมูลเฉพาะในเว็บไซต์ 🎌</span>
            </div>
          </button>
        )}
      </div>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex h-[600px] w-[95vw] max-w-[430px] flex-col rounded-3xl border border-rose-100 bg-white/95 shadow-2xl backdrop-blur-xl transition-all duration-300 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-rose-100/80 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white">Japan Tabi AI</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/25 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                    <ShieldCheck className="h-2.5 w-2.5" /> เว็บนี้เท่านั้น
                  </span>
                </div>
                <p className="text-[10.5px] text-rose-100">ตอบเฉพาะข้อมูลสถานที่และระบบในเว็บ</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="ล้างแชทเพื่อเริ่มใหม่"
                className="rounded-xl p-1.5 text-rose-100 transition-colors hover:bg-white/15 hover:text-white cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="ปิดหน้าต่างแชท"
                className="rounded-xl p-1.5 text-rose-100 transition-colors hover:bg-white/15 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Info Banner inside chat */}
          <div className="flex items-center gap-1.5 bg-rose-50/90 px-3.5 py-1.5 text-[10.5px] text-rose-700 border-b border-rose-100/60">
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span>AI ตอบเฉพาะข้อมูลสถานที่ ({destinations.length} แห่ง) และฟีเจอร์ในเว็บนี้</span>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-end gap-1.5 max-w-[88%]">
                  {msg.sender === 'ai' && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-0.5">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-xs ${
                      msg.sender === 'user'
                        ? 'rounded-br-xs bg-rose-500 text-white font-medium'
                        : msg.isOutOfScope
                        ? 'rounded-bl-xs bg-amber-50 text-slate-800 border border-amber-200'
                        : 'rounded-bl-xs bg-slate-50 text-slate-750 border border-slate-100'
                    }`}
                  >
                    <div className="whitespace-pre-line text-xs">
                      {msg.text}
                    </div>

                    {/* Matched Destination Cards within AI Bubble */}
                    {msg.matchedDestinations && msg.matchedDestinations.length > 0 && (
                      <div className="mt-3 space-y-2 pt-2 border-t border-slate-200/60">
                        <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-rose-500" />
                          สถานที่ในเว็บที่ตรงกับคำถาม:
                        </p>
                        <div className="space-y-1.5">
                          {msg.matchedDestinations.map((dest) => {
                            const isFav = wishlist.some((d) => d.id === dest.id);
                            return (
                              <div
                                key={dest.id}
                                className="group/item flex items-center justify-between gap-2 rounded-xl bg-white p-2 border border-slate-200/70 shadow-xs hover:border-rose-200 transition-all"
                              >
                                <div 
                                  className="flex items-center gap-2 cursor-pointer min-w-0"
                                  onClick={() => onSelectDestination?.(dest)}
                                >
                                  <img
                                    src={dest.imageUrl}
                                    alt={dest.nameTh}
                                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                                  />
                                  <div className="min-w-0 text-left">
                                    <p className="truncate text-[11px] font-bold text-slate-800 group-hover/item:text-rose-600">
                                      {dest.nameTh}
                                    </p>
                                    <p className="text-[10px] text-slate-400 truncate">
                                      {dest.region} • {dest.admissionFeeYen === 0 ? 'ฟรี' : `¥${dest.admissionFeeYen.toLocaleString()}`}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {onToggleWishlist && (
                                    <button
                                      onClick={() => {
                                        if (!isAuthenticated && onOpenLoginModal) {
                                          onOpenLoginModal();
                                        } else {
                                          onToggleWishlist(dest);
                                        }
                                      }}
                                      title={isFav ? 'อยู่ในรายการโปรด' : 'เพิ่มในรายการโปรด'}
                                      className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                                        isFav
                                          ? 'text-rose-500 bg-rose-50'
                                          : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100'
                                      }`}
                                    >
                                      <Heart className={`h-3.5 w-3.5 ${isFav ? 'fill-rose-500' : ''}`} />
                                    </button>
                                  )}

                                  {onAddToItinerary && (
                                    <button
                                      onClick={() => {
                                        if (!isAuthenticated && onOpenLoginModal) {
                                          onOpenLoginModal();
                                        } else {
                                          onAddToItinerary(dest);
                                        }
                                      }}
                                      title="เพิ่มลงในแผนทริป Day 1"
                                      className="rounded-lg bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                                    >
                                      <PlusCircle className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <span className="mt-1 px-1 text-[10px] text-slate-400">
                  {msg.timestamp}
                </span>

                {/* Suggestion Chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-[95%]">
                    {msg.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sug)}
                        className="rounded-full border border-rose-200/80 bg-rose-50/70 px-2.5 py-1 text-[11px] font-medium text-rose-700 transition-all hover:bg-rose-100 hover:border-rose-300 cursor-pointer text-left shadow-2xs"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                  <Bot className="h-3.5 w-3.5 animate-pulse" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl bg-slate-50 px-3 py-2 border border-slate-100">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-rose-400 [animation-delay:-0.3s]"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-rose-400 [animation-delay:-0.15s]"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-rose-400"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions bottom drawer */}
          <div className="border-t border-slate-100 bg-slate-50/80 px-3 py-2">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
              {QUICK_SUGGESTIONS.slice(0, 3).map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-slate-600 border border-slate-200/70 hover:border-rose-300 hover:text-rose-600 cursor-pointer shadow-2xs"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="ถามข้อมูลสถานที่หรือระบบในเว็บนี้เท่านั้น..."
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                  inputText.trim()
                    ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
