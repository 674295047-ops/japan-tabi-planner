import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  RotateCcw, 
  MapPin, 
  Calendar, 
  Heart, 
  PlusCircle, 
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Compass
} from 'lucide-react';
import type { Destination } from '../types';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  matchedDestinations?: Destination[];
  suggestions?: string[];
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
  '🌸 เที่ยวญี่ปุ่นช่วงใบไม้ผลิที่ไหนดี?',
  '🍁 จุดชมใบไม้เปลี่ยนสีไฮไลท์',
  '❄️ อยากเล่นหิมะหรือไปฮอกไกโด',
  '⛩️ แนะนำวัดและศาลเจ้าชื่อดัง',
  '🍜 แนะนำของกินและย่านช้อปปิ้ง',
  '💰 มีสถานที่เที่ยวฟรีหรือค่าเข้าถูกไหม?',
  '🚅 วิธีวางแผนเที่ยวคันไซ โตเกียว หรือคิวชู',
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
      text: 'สวัสดีครับ! ยินดีต้อนรับสู่ **Japan Tabi AI Assistant** 🎌✨\nผมคือผู้ช่วยอัจฉริยะสำหรับวางแผนเที่ยวญี่ปุ่น คุณสามารถถามเกี่ยวกับสถานที่ท่องเที่ยว ภูมิภาค ฤดูกาล หรือสอบถามงบประมาณและข้อมูลการเดินทางได้เลยครับ!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        '🌸 แนะนำที่เที่ยวฤดูใบไม้ผลิ',
        '⛩️ ศาลเจ้าหรือวัดสวยๆ',
        '🍜 ย่านของกินยอดฮิต',
        '🗻 แนะนำที่เที่ยววิวฟูจิ',
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

  // AI Response generator with destination matching and natural travel knowledge
  const generateAIResponse = (userQuery: string): { text: string; matched: Destination[]; suggestions: string[] } => {
    const query = userQuery.toLowerCase().trim();
    let matched: Destination[] = [];
    let text = '';
    let suggestions: string[] = [];

    // Check for Season intent
    if (query.includes('ใบไม้ผลิ') || query.includes('ซากุระ') || query.includes('spring')) {
      matched = destinations.filter((d) => d.recommendedSeasons?.includes('spring')).slice(0, 4);
      text = `🌸 สำหรับ **ฤดูใบไม้ผลิ (มีนาคม - พฤษภาคม)** เป็นช่วงเวลาทองของการชมดอกซากุระบานสะพรั่ง อากาศเย็นสบายกำลังดี (10°C - 20°C)!\n\nสถานที่ไฮไลท์ที่แนะนำ:\n- เดินชมซากุระที่วัดและปราสาทชื่อดัง\n- ล่องเรือชมกลีบซากุระในแม่น้ำหรือคลอง\n- ปิกนิกฮานามิ (Hanami) ในสวนสาธารณะ`;
      suggestions = ['🍁 แล้วฤดูใบไม้ร่วงล่ะ?', '⛩️ แนะนำวัดในเกียวโต', '🚅 วางแผนทริป 3 วัน'];
    } else if (query.includes('ใบไม้เปลี่ยนสี') || query.includes('ใบไม้แดง') || query.includes('ฤดูใบไม้ร่วง') || query.includes('autumn') || query.includes('fall')) {
      matched = destinations.filter((d) => d.recommendedSeasons?.includes('autumn')).slice(0, 4);
      text = `🍁 ใน **ฤดูใบไม้ร่วง (กันยายน - พฤศจิกายน)** ญี่ปุ่นจะถูกแต่งแต้มด้วยสีส้ม แดง และทองอย่างตระการตา อากาศสดชื่นและฟ้าโปร่งมาก เหมาะกับการท่องเที่ยวและถ่ายรูปสุดๆ ครับ!`;
      suggestions = ['❄️ เที่ยวหน้าหนาวมีที่ไหนเด่น?', '🌸 จุดชมซากุระยอดนิยม', '🍜 ของกินขึ้นชื่อ'];
    } else if (query.includes('หิมะ') || query.includes('หน้าหนาว') || query.includes('ฤดูหนาว') || query.includes('winter') || query.includes('สกี')) {
      matched = destinations.filter((d) => d.recommendedSeasons?.includes('winter') || d.region === 'Hokkaido' || d.region === 'Tohoku' || d.region === 'Chubu').slice(0, 4);
      text = `❄️ สำหรับ **ฤดูหนาว (ธันวาคม - กุมภาพันธ์)** ไฮไลท์ที่ไม่ควรพลาดคือเทศกาลหิมะที่ฮอกไกโด แช่ออนเซ็นกลางหิมะ (Rotenburo) และกิจกรรมสกีสุดมันส์ที่รีสอร์ทระดับโลก!`;
      suggestions = ['♨️ แนะนำออนเซ็นสวยๆ', '⛄ แนะนำที่เที่ยวฮอกไกโด', '💰 งบเที่ยวญี่ปุ่นประมาณเท่าไหร่'];
    } else if (query.includes('หน้าร้อน') || query.includes('ฤดูร้อน') || query.includes('summer')) {
      matched = destinations.filter((d) => d.recommendedSeasons?.includes('summer') || d.region === 'Hokkaido' || d.region === 'Okinawa').slice(0, 4);
      text = `☀️ ใน **ฤดูร้อน (มิถุนายน - สิงหาคม)** ไฮไลท์คือเทศกาลฤดูร้อน (Matsuri), เทศกาลดอกไม้ไฟ (Hanabi), ชมทุ่งลาเวนเดอร์ที่ฟุราโนะ ฮอกไกโด และทะเลใสที่โอกินาวา!`;
      suggestions = ['🌸 ที่เที่ยวฤดูใบไม้ผลิ', '🍜 ราเมนและสตรีทฟู้ด', '🏯 ปราสาทและประวัติศาสตร์'];
    }

    // Check for Region intent
    else if (query.includes('โตเกียว') || query.includes('tokyo') || query.includes('คันโต') || query.includes('kanto')) {
      matched = destinations.filter((d) => d.region === 'Kanto' || d.prefecture.includes('Tokyo') || d.prefecture.includes('โตเกียว')).slice(0, 4);
      text = `🗼 **ภูมิภาคคันโต / โตเกียว (Tokyo & Kanto)**\nมหานครศูนย์กลางความทันสมัย ช้อปปิ้ง แสงสีเสียง และผสมผสานวัดวาอารามดั้งเดิมอย่างลงตัว เดินทางสะดวกด้วยรถไฟ JR และ Tokyo Metro`;
      suggestions = ['⛩️ วัดเซ็นโซจิ (Sensoji)', '🍜 ย่านของกินในโตเกียว', '🚄 เที่ยวข้ามไปโอซาก้า'];
    } else if (query.includes('โอซาก้า') || query.includes('osaka') || query.includes('เกียวโต') || query.includes('kyoto') || query.includes('คันไซ') || query.includes('kansai') || query.includes('นารา')) {
      matched = destinations.filter((d) => d.region === 'Kansai').slice(0, 4);
      text = `⛩️ **ภูมิภาคคันไซ (Kansai - Osaka, Kyoto, Nara, Kobe)**\nดินแดนแห่งวัฒนธรรมโบราณและครัวแห่งญี่ปุ่น! เกียวโตเต็มไปด้วยวัดพันปีและศาลเจ้าสีสาด ขณะที่โอซาก้าเต็มไปด้วยเสน่ห์ของอาหาร สตรีทฟู้ด และความคึกคัก`;
      suggestions = ['🍣 ตลาดคุโรมง โอซาก้า', '⛩️ ศาลเจ้าฟูชิมิอินาริ', '🏯 ปราสาทโอซาก้า'];
    } else if (query.includes('ฮอกไกโด') || query.includes('hokkaido') || query.includes('ซัปโปโร')) {
      matched = destinations.filter((d) => d.region === 'Hokkaido').slice(0, 4);
      text = `⛄ **ฮอกไกโด (Hokkaido)**\nเกาะเหนือสุดของญี่ปุ่น โด่งดังด้วยทัศนียภาพธรรมชาติอันยิ่งใหญ่ ทุ่งดอกไม้ฤดูร้อน หิมะขาวปุยนุ่ม (Powder Snow) และอาหารทะเลสดใหม่ระดับพรีเมียม!`;
      suggestions = ['❄️ เทศกาลหิมะซัปโปโร', '🦀 อาหารทะเลฮอกไกโด', '🌸 แนะนำเที่ยวช่วงใบไม้ผลิ'];
    } else if (query.includes('ฟูจิ') || query.includes('fuji') || query.includes('คาวากุจิโกะ') || query.includes('kawaguchiko') || query.includes('ชูบุ') || query.includes('chubu')) {
      matched = destinations.filter((d) => d.nameEn.toLowerCase().includes('fuji') || d.nameTh.includes('ฟูจิ') || d.region === 'Chubu').slice(0, 4);
      text = `🗻 **ภูเขาไฟฟูจิ & บริเวณทะเลสาบคาวากุจิโกะ (Mount Fuji)**\nสัญลักษณ์อันเป็นนิรันดร์ของญี่ปุ่น สามารถชมวิวฟูจิสะท้อนผิวน้ำที่ทะเลสาบคาวากุจิโกะ หรือขึ้นกระเช้าลอยฟ้าและแช่ออนเซ็นพร้อมวิวฟูจิสุดโรแมนติกครับ!`;
      suggestions = ['⛩️ จุดถ่ายรูปเจดีย์ชูเรโตะ', '♨️ แนะนำที่พักออนเซ็น', '🚅 วิธีเดินทางจากโตเกียว'];
    } else if (query.includes('คิวชู') || query.includes('kyushu') || query.includes('ฟุกุโอกะ')) {
      matched = destinations.filter((d) => d.region === 'Kyushu').slice(0, 4);
      text = `🌋 **ภูมิภาคคิวชู (Kyushu - Fukuoka, Beppu, Kumamoto)**\nดินแดนออนเซ็นระดับท็อป ภูเขาไฟธรรมชาติ และราเมนทงคตสึเข้มข้น มีรถไฟท่องเที่ยวดีไซน์เอกลักษณ์มากมายครับ`;
      suggestions = ['♨️ แช่ออนเซ็นเบปปุ', '🍜 ฮากาตะราเมน', '🏯 ปราสาทคุมาโมโตะ'];
    }

    // Check for Category intent
    else if (query.includes('วัด') || query.includes('ศาลเจ้า') || query.includes('temple') || query.includes('shrine')) {
      matched = destinations.filter((d) => d.category === 'temple' || d.category === 'history').slice(0, 4);
      text = `⛩️ **วัดและศาลเจ้าในญี่ปุ่น (Temples & Shrines)**\nสถานที่ศักดิ์สิทธิ์และงดงามด้วยสถาปัตยกรรมไม้โบราณ ทั้งวัดเซ็นโซจิในโตเกียว, เสาโทริอิพันต้นฟูชิมิอินาริ, และวัดคิโยมิสึเดระ (วัดน้ำใส)`;
      suggestions = ['⛩️ วิธีขอพรที่ศาลเจ้า', '🍁 วัดชมใบไม้เปลี่ยนสี', '🌸 ซากุระรอบวัด'];
    } else if (query.includes('กิน') || query.includes('อาหาร') || query.includes('ราเมน') || query.includes('ซูชิ') || query.includes('food') || query.includes('เนื้อ')) {
      matched = destinations.filter((d) => d.category === 'food' || d.descriptionTh.includes('อาหาร') || d.tipsTh?.includes('กิน')).slice(0, 4);
      text = `🍣 **แหล่งของกินและสตรีทฟู้ด (Food & Gourmet)**\nอาหารญี่ปุ่นขึ้นชื่อระดับโลก! ไม่ว่าจะเป็นซูชิสดๆ, ราเมนร้อนๆ, ทาโกะยากิ, หรือเนื้อวากิวชั้นเลิศ ลองแวะตลาดยอดนิยมหรือย่านสตรีทฟู้ดชื่อดังเพื่อสัมผัสรสชาติต้นตำรับ`;
      suggestions = ['🍜 ราเมนเจ้าดัง', '🍣 ตลาดปลาซึกิจิและคุโรมง', '🍡 ขนมหวานสไตล์ญี่ปุ่น'];
    } else if (query.includes('ฟรี') || query.includes('ประหยัด') || query.includes('งบ') || query.includes('ราคา') || query.includes('ค่าเข้า')) {
      matched = destinations.filter((d) => d.admissionFeeYen === 0).slice(0, 4);
      text = `💰 **สถานที่ท่องเที่ยวฟรี & ประหยัดงบ (Free & Budget-Friendly)**\nหลายแลนด์มาร์กระดับโลกในญี่ปุ่นสามารถเข้าชมได้ฟรี เช่น ศาลเจ้าฟูชิมิอินาริ, ศาลเจ้าเมจิ, วัดเซ็นโซจิ, สวนสาธารณะนารา หรือเดินเล่นย่านโดทงโบริ!`;
      suggestions = ['🚅 แนะนำ JR Pass คุ้มไหม?', '🍱 ทริคประหยัดค่าอาหาร', '⛩️ ศาลเจ้าเข้าชมฟรี'];
    } else if (query.includes('แผน') || query.includes('ทริป') || query.includes('วัน') || query.includes('itinerary')) {
      matched = destinations.slice(0, 3);
      text = `📅 **คำแนะนำการจัดแผนเที่ยว (Itinerary Planning)**\n- **ทริป 3-5 วันแรก:** แนะนำเลือก 1 ภูมิภาค เช่น โตเกียวและปริมณฑล หรือ คันไซ (โอซาก้า-เกียวโต-นารา)\n- **การเดินทาง:** ใช้บัตร IC Card (Suica/Pasmo/ICOCA) แตะสะดวกทุกสายรถไฟ\n- คุณสามารถใช้แท็บ **"จัดแผนทริป" (Itinerary Planner)** ของเว็บเรา เพื่อลากวางสถานที่และจัดตารางเวลาได้อย่างง่ายดายครับ!`;
      suggestions = ['🌸 ที่เที่ยวฤดูใบไม้ผลิ', '🗼 ที่เที่ยวโตเกียว', '⛩️ ที่เที่ยวคันไซ'];
    } else {
      // General keyword search in destination catalog
      matched = destinations.filter((d) => 
        d.nameTh.toLowerCase().includes(query) ||
        d.nameEn.toLowerCase().includes(query) ||
        d.descriptionTh.toLowerCase().includes(query) ||
        d.prefecture.toLowerCase().includes(query)
      ).slice(0, 4);

      if (matched.length > 0) {
        text = `🔎 พบ **${matched.length} สถานที่** ที่ตรงกับ "${userQuery}" ที่น่าสนใจครับ:`;
        suggestions = ['📍 ดูรายละเอียดสถานที่', '📅 เพิ่มเข้าแผนทริป', '🌸 แนะนำเที่ยวตามฤดู'];
      } else {
        // Fallback helpful travel AI message
        text = `🎌 ยินดีแนะนำการเดินทางครับ! สำหรับเรื่อง "${userQuery}" แนะนำให้ลองค้นหาตามหมวดหมู่ เช่น:\n- **ภูมิภาค:** คันโต, คันไซ, ฮอกไกโด, คิวชู, ชูบุ\n- **ฤดูกาล:** ซากุระใบไม้ผลิ, ใบไม้แดง, หิมะหน้าหนาว\n- **ประเภท:** วัดและศาลเจ้า, ธรรมชาติ, ของกิน, แหล่งช้อปปิ้ง\n\nหรือเลือกหัวข้อคำถามด่วนด้านล่างได้เลยครับ! 😊`;
        matched = destinations.slice(0, 3);
        suggestions = QUICK_SUGGESTIONS.slice(0, 4);
      }
    }

    return { text, matched, suggestions };
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
      const response = generateAIResponse(query);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedDestinations: response.matched,
        suggestions: response.suggestions,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
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
        text: 'เริ่มต้นบทสนทนาใหม่แล้วครับ! มีอะไรให้ **Japan Tabi AI** ช่วยวางแผนการเดินทางในญี่ปุ่นวันนี้บ้างครับ? 🌸🎌',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          '🌸 แนะนำที่เที่ยวฤดูใบไม้ผลิ',
          '⛩️ ศาลเจ้าหรือวัดสวยๆ',
          '🍜 ย่านของกินยอดฮิต',
          '🗻 แนะนำที่เที่ยววิวฟูจิ',
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
              <span className="block text-xs font-bold leading-tight tracking-wide">Japan Tabi AI</span>
              <span className="block text-[10px] text-rose-100 font-medium">ถามผู้ช่วยเที่ยวญี่ปุ่น 🎌</span>
            </div>
          </button>
        )}
      </div>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex h-[580px] w-[95vw] max-w-[420px] flex-col rounded-3xl border border-rose-100 bg-white/95 shadow-2xl backdrop-blur-xl transition-all duration-300 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-rose-100/80 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white">Japan Tabi AI</h3>
                  <span className="inline-flex items-center rounded-full bg-emerald-400/20 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-200">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-rose-100">ผู้ช่วยอัจฉริยะวางแผนเที่ยวญี่ปุ่น</p>
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
                          สถานที่แนะนำที่เกี่ยวข้อง:
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
                                      {dest.region} • {dest.prefecture}
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

          {/* Quick suggestions bottom drawer if open */}
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
                placeholder="พิมพ์ถามสถานที่, ฤดู, หรือคำถามเที่ยวญี่ปุ่น..."
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
