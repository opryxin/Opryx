import React, { useState, useEffect, useRef } from "react";
import { 
  LayoutDashboard, 
  Briefcase, 
  DollarSign, 
  MessageSquare, 
  FileText, 
  Plus, 
  Send, 
  Check, 
  CheckCircle2, 
  Clock, 
  User, 
  LogOut, 
  Sliders, 
  TrendingUp, 
  Video, 
  Instagram, 
  Share2, 
  FileSignature, 
  Bell, 
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Lock,
  Unlock,
  UploadCloud,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Globe,
  CreditCard,
  File
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import opryxLogo from "../assets/images/transparent logo.png";

const navLogoIcon = opryxLogo;

interface CreatorDashboardProps {
  user: any;
  onLogout: () => void;
}

interface Deal {
  id: string;
  brand: string;
  amount: number;
  platform: "YouTube" | "Instagram" | "TikTok" | "Twitch" | "Newsletter";
  status: "Negotiating" | "Contract Sent" | "Awaiting Deliverables" | "In Review" | "Completed";
  deliverables: string[];
  dueDate: string;
}

interface ChatMessage {
  id: string;
  sender: "manager" | "creator";
  text: string;
  timestamp: string;
}

interface DocItem {
  id: string;
  name: string;
  type: string;
  status: "Signed" | "Needs Signature" | "Draft";
  signedDate?: string;
  content: string;
}

// Secure Vault Encryption Helpers
const ENCRYPTION_PREFIX = "OPRYX_SECURE_V1:";

function encryptText(text: string, email: string, pass: string): string {
  const fullText = ENCRYPTION_PREFIX + text;
  const secretKey = `${email.trim().toLowerCase()}#${pass}`;
  let result = "";
  for (let i = 0; i < fullText.length; i++) {
    const charCode = fullText.charCodeAt(i);
    const keyChar = secretKey.charCodeAt(i % secretKey.length);
    result += String.fromCharCode(charCode ^ keyChar);
  }
  return btoa(encodeURIComponent(result));
}

function decryptText(encryptedText: string, email: string, pass: string): string {
  const rawText = decodeURIComponent(atob(encryptedText));
  const secretKey = `${email.trim().toLowerCase()}#${pass}`;
  let result = "";
  for (let i = 0; i < rawText.length; i++) {
    const charCode = rawText.charCodeAt(i);
    const keyChar = secretKey.charCodeAt(i % secretKey.length);
    result += String.fromCharCode(charCode ^ keyChar);
  }
  
  if (result.startsWith(ENCRYPTION_PREFIX)) {
    return result.slice(ENCRYPTION_PREFIX.length);
  } else {
    throw new Error("Checksum mismatch");
  }
}

interface EncryptedDoc {
  id: string;
  name: string;
  fileSize: string;
  targetEmail: string;
  encryptedContent: string;
  uploadedAt: string;
}

export default function CreatorDashboard({ user, onLogout }: CreatorDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "deals" | "earnings" | "chat" | "vault" | "profile">("overview");

  // Load customizable profile
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem(`opryx_profile_${user?.email || "default"}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      fullName: user?.user_metadata?.full_name || "Demo Creator",
      email: user?.email || "partner@opryx.com",
      avatarUrl: "",
      bio: "High-end content creator partner specializing in modern technology, high-fidelity design systems, and educational tutorials.",
      niche: "Tech & Education",
      socials: {
        youtube: "@opryx_creator",
        instagram: "opryx.creator",
        tiktok: "opryx.dev",
        twitch: "opryx_live",
        newsletter: "opryx_weekly"
      },
      payment: {
        method: "Direct Deposit",
        bankName: "Chase Bank",
        accountNo: "•••• 4820",
        routingNo: "•••• 0210"
      }
    };
  });

  // Load custom encrypted documents
  const [encryptedDocs, setEncryptedDocs] = useState<EncryptedDoc[]>(() => {
    const saved = localStorage.getItem(`opryx_enc_docs_${user?.email || "default"}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: "enc-1",
        name: "Confidential_Acme_Sponsorship_Proposal.txt",
        fileSize: "1.4 KB",
        targetEmail: user?.email || "partner@opryx.com",
        encryptedContent: encryptText("ACME BRAND COLLABORATION BUDGET:\n\nTotal Budget: $25,000\nDeliverables: 3 Reels, 2 Dedicated YouTube sponsorships\nNote: Keep this completely private inside OPRYX vault storage.", user?.email || "partner@opryx.com", "password123"),
        uploadedAt: "July 5, 2026"
      }
    ];
  });

  // Vault sub-tabs state
  const [vaultSubTab, setVaultSubTab] = useState<"compliance" | "encrypted">("compliance");
  const [selectedEncDoc, setSelectedEncDoc] = useState<EncryptedDoc | null>(null);
  
  // Encrypted document upload/create states
  const [newEncDocName, setNewEncDocName] = useState("");
  const [newEncDocContent, setNewEncDocContent] = useState("");
  const [newEncDocEmail, setNewEncDocEmail] = useState("");
  const [newEncDocPass, setNewEncDocPass] = useState("");
  const [showEncFormPass, setShowEncFormPass] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Decryption terminal states
  const [decryptEmail, setDecryptEmail] = useState("");
  const [decryptPass, setDecryptPass] = useState("");
  const [showDecryptPass, setShowDecryptPass] = useState(false);
  const [decryptedFileText, setDecryptedFileText] = useState<string | null>(null);
  const [decryptionError, setDecryptionError] = useState("");

  // Profile Form States
  const [editFullName, setEditFullName] = useState(profile.fullName);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editNiche, setEditNiche] = useState(profile.niche);
  const [editAvatarUrl, setEditAvatarUrl] = useState(profile.avatarUrl);
  
  const [editYoutube, setEditYoutube] = useState(profile.socials.youtube);
  const [editInstagram, setEditInstagram] = useState(profile.socials.instagram);
  const [editTiktok, setEditTiktok] = useState(profile.socials.tiktok);
  const [editTwitch, setEditTwitch] = useState(profile.socials.twitch);
  const [editNewsletter, setEditNewsletter] = useState(profile.socials.newsletter);
  
  const [editPayMethod, setEditPayMethod] = useState(profile.payment.method);
  const [editBankName, setEditBankName] = useState(profile.payment.bankName);
  const [editAccountNo, setEditAccountNo] = useState(profile.payment.accountNo);
  const [editRoutingNo, setEditRoutingNo] = useState(profile.payment.routingNo);
  
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Profile forms sync with profile changes
  useEffect(() => {
    setEditFullName(profile.fullName);
    setEditBio(profile.bio);
    setEditNiche(profile.niche);
    setEditAvatarUrl(profile.avatarUrl);
    setEditYoutube(profile.socials.youtube);
    setEditInstagram(profile.socials.instagram);
    setEditTiktok(profile.socials.tiktok);
    setEditTwitch(profile.socials.twitch);
    setEditNewsletter(profile.socials.newsletter);
    setEditPayMethod(profile.payment.method);
    setEditBankName(profile.payment.bankName);
    setEditAccountNo(profile.payment.accountNo);
    setEditRoutingNo(profile.payment.routingNo);
  }, [profile]);

  const handleFileUpload = (file: File) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Max file size exceeded. Please upload files under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setNewEncDocContent(text || "");
      setNewEncDocName(file.name);
      setUploadError("");
    };
    reader.onerror = () => {
      setUploadError("Failed to read file.");
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleEncryptAndStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEncDocName.trim() || !newEncDocContent.trim() || !newEncDocEmail.trim() || !newEncDocPass.trim()) {
      setUploadError("All fields are required to secure the document.");
      return;
    }

    try {
      const encrypted = encryptText(newEncDocContent, newEncDocEmail, newEncDocPass);
      const newDocItem: EncryptedDoc = {
        id: `enc-${Date.now()}`,
        name: newEncDocName.trim(),
        fileSize: `${(newEncDocContent.length / 1024).toFixed(2)} KB`,
        targetEmail: newEncDocEmail.trim().toLowerCase(),
        encryptedContent: encrypted,
        uploadedAt: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })
      };

      setEncryptedDocs(prev => [newDocItem, ...prev]);
      setUploadSuccess(true);
      setUploadError("");
      
      // Reset form
      setNewEncDocName("");
      setNewEncDocContent("");
      setNewEncDocEmail("");
      setNewEncDocPass("");
      
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      setUploadError("Encryption failure. Please try again.");
    }
  };

  const handleDecryptDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEncDoc) return;
    try {
      const decrypted = decryptText(selectedEncDoc.encryptedContent, decryptEmail, decryptPass);
      setDecryptedFileText(decrypted);
      setDecryptionError("");
    } catch (err: any) {
      setDecryptionError(err.message || "Decryption failed. Invalid email or password.");
      setDecryptedFileText(null);
    }
  };

  const triggerFileDownload = () => {
    if (!selectedEncDoc || !decryptedFileText) return;
    const blob = new Blob([decryptedFileText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = selectedEncDoc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      fullName: editFullName,
      email: profile.email,
      avatarUrl: editAvatarUrl,
      bio: editBio,
      niche: editNiche,
      socials: {
        youtube: editYoutube,
        instagram: editInstagram,
        tiktok: editTiktok,
        twitch: editTwitch,
        newsletter: editNewsletter
      },
      payment: {
        method: editPayMethod,
        bankName: editBankName,
        accountNo: editAccountNo,
        routingNo: editRoutingNo
      }
    };
    setProfile(updated);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
  };
  
  // App states
  const [deals, setDeals] = useState<Deal[]>([
    {
      id: "deal-1",
      brand: "Northwind Co.",
      amount: 8500,
      platform: "YouTube",
      status: "In Review",
      deliverables: ["60s integrated ad", "Link in description", "Community post"],
      dueDate: "July 24, 2026"
    },
    {
      id: "deal-2",
      brand: "Acme Wellness",
      amount: 4200,
      platform: "Instagram",
      status: "Awaiting Deliverables",
      deliverables: ["1x Reel", "2x Stories with swipe-up"],
      dueDate: "July 30, 2026"
    },
    {
      id: "deal-3",
      brand: "Apex Gaming",
      amount: 12000,
      platform: "Twitch",
      status: "Negotiating",
      deliverables: ["Dedicated stream", "Logo overlay 2hr", "Chat commands"],
      dueDate: "August 15, 2026"
    },
    {
      id: "deal-4",
      brand: "SaaS Rocket",
      amount: 5000,
      platform: "Newsletter",
      status: "Completed",
      deliverables: ["Primary sponsor slot", "Product feature section"],
      dueDate: "June 28, 2026"
    }
  ]);

  // Deliverables checklist status map
  const [deliverableStatus, setDeliverableStatus] = useState<Record<string, boolean>>({
    "deal-1-0": true,
    "deal-1-1": true,
    "deal-1-2": false,
    "deal-2-0": false,
    "deal-2-1": false,
    "deal-3-0": false,
    "deal-3-1": false,
    "deal-3-2": false,
    "deal-4-0": true,
    "deal-4-1": true,
  });

  const toggleDeliverable = (dealId: string, idx: number) => {
    const key = `${dealId}-${idx}`;
    setDeliverableStatus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Add brand deal state
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [newBrand, setNewBrand] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newPlatform, setNewPlatform] = useState<Deal["platform"]>("YouTube");
  const [newDeliverables, setNewDeliverables] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  const handleAddDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand || !newAmount) return;

    const parsedAmount = parseFloat(newAmount) || 0;
    const deliverablesList = newDeliverables
      ? newDeliverables.split(",").map(d => d.trim()).filter(Boolean)
      : ["Custom integration slot"];

    const newDealItem: Deal = {
      id: `deal-${Date.now()}`,
      brand: newBrand,
      amount: parsedAmount,
      platform: newPlatform,
      status: "Negotiating",
      deliverables: deliverablesList,
      dueDate: newDueDate || "TBD"
    };

    setDeals(prev => [newDealItem, ...prev]);
    
    // reset form
    setNewBrand("");
    setNewAmount("");
    setNewPlatform("YouTube");
    setNewDeliverables("");
    setNewDueDate("");
    setIsAddDealOpen(false);
  };

  // Chat manager state
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "manager",
      text: "Hey! Glad you signed in to your portal. I'm currently reviewing the final contract brief for Apex Gaming. They want to confirm your Twitch stream schedule.",
      timestamp: "10:24 AM"
    },
    {
      id: "msg-2",
      sender: "creator",
      text: "Awesome! The Twitch stream is locked in for August 15th, 6 PM PST. Let me know if that works for their tech setup.",
      timestamp: "10:28 AM"
    },
    {
      id: "msg-3",
      sender: "manager",
      text: "Perfect, I will pass that on and get the contract updated. Also, congratulations on the SaaS Rocket payout — it has been processed and scheduled for release!",
      timestamp: "10:30 AM"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    localStorage.setItem(`opryx_profile_${user?.email || "default"}`, JSON.stringify(profile));
  }, [profile, user]);

  useEffect(() => {
    localStorage.setItem(`opryx_enc_docs_${user?.email || "default"}`, JSON.stringify(encryptedDocs));
  }, [encryptedDocs, user]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "creator",
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const textSent = chatInput;
    setChatInput("");

    // Trigger manager smart replies
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let managerReply = "Got it! I will check that with the team and get back to you shortly.";
      
      const lowerText = textSent.toLowerCase();
      if (lowerText.includes("payout") || lowerText.includes("money") || lowerText.includes("revenue") || lowerText.includes("earning")) {
        managerReply = "Your revenue statements are up to date in the 'Earnings' tab. The SaaS Rocket payout ($5,000) is scheduled for direct deposit on July 10, 2026. Let me know if you need any adjustments!";
      } else if (lowerText.includes("contract") || lowerText.includes("sign") || lowerText.includes("vault") || lowerText.includes("agreement")) {
        managerReply = "I've uploaded the representation agreement draft to your 'Document Safe' tab. Please review and sign it electronically so we can officially lock down the new brand negotiations!";
      } else if (lowerText.includes("deal") || lowerText.includes("brand") || lowerText.includes("northwind") || lowerText.includes("acme")) {
        managerReply = "I am on top of all brand deals. Northwind is happy with the draft and is signing off on the deliverables checklist now. Apex is finalized, and Acme is ready for asset uploads.";
      } else if (lowerText.includes("hello") || lowerText.includes("hi") || lowerText.includes("hey")) {
        managerReply = "Hey! Hope your day is going great. Let me know how I can help you manage your campaigns today!";
      }

      setMessages(prev => [...prev, {
        id: `msg-manager-${Date.now()}`,
        sender: "manager",
        text: managerReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1800);
  };

  // Document vault state
  const [docs, setDocs] = useState<DocItem[]>([
    {
      id: "doc-1",
      name: "OPRYX Talent Representation Agreement",
      type: "Exclusive Representation Contract",
      status: "Needs Signature",
      content: `OPRYX TALENT REPRESENTATION AGREEMENT

This Agreement is made as of July 7, 2026, by and between OPRYX ("Manager") and the talent user ("Creator").

1. Scope of Services: Manager shall act as Creator's exclusive representative for all brand deals, sponsorships, licensing, and brand consulting collaborations.
2. Commission: Manager shall receive a standard fifteen percent (15%) commission on gross revenues generated from agreements negotiated during the term.
3. Term: This agreement shall remain in effect for an initial period of twelve (12) months.

By signing below, Creator agrees to the exclusive representation terms of OPRYX.`
    },
    {
      id: "doc-2",
      name: "Northwind Co. Deliverables Brief",
      type: "Brand Collaboration Agreement",
      status: "Signed",
      signedDate: "July 2, 2026",
      content: `BRAND COLLABORATION BRIEF: NORTHWIND CO.

Brand Partner: Northwind Co.
Sponsorship Fee: $8,500 USD
Platform: YouTube Integration

Deliverables Checklist:
- 1x 60-90 second integrated video slot in upcoming tech video.
- Verbal call to action + tracking link in top 3 lines of video description.
- Community tab post with custom brand graphics.

Signed electronically. All terms locked.`
    },
    {
      id: "doc-3",
      name: "Standard W-9 Form (2026)",
      type: "Tax Onboarding Document",
      status: "Signed",
      signedDate: "June 25, 2026",
      content: `W-9 REQUEST FOR TAXPAYER IDENTIFICATION AND CERTIFICATION

Information is saved securely within our protected GCP compliance storage vault.
Taxpayer ID (TIN) provided and validated.

Status: COMPLIANT`
    }
  ]);

  const [activeSigningDoc, setActiveSigningDoc] = useState<DocItem | null>(null);
  const [signatureText, setSignatureText] = useState("");

  const handleSignDocument = () => {
    if (!activeSigningDoc || !signatureText.trim()) return;

    setDocs(prev => prev.map(doc => {
      if (doc.id === activeSigningDoc.id) {
        return {
          ...doc,
          status: "Signed",
          signedDate: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }),
          content: `${doc.content}\n\nElectronically Signed By: ${signatureText}\nDate: ${new Date().toLocaleDateString()}`
        };
      }
      return doc;
    }));

    // notify in chat
    setMessages(prev => [...prev, {
      id: `msg-sig-${Date.now()}`,
      sender: "creator",
      text: `I have electronically signed the document: "${activeSigningDoc.name}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `msg-sig-reply-${Date.now()}`,
        sender: "manager",
        text: `Thank you! I received your signed "${activeSigningDoc.name}". I've countersigned it and archived it securely in your vault. We are ready to roll!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);

    setSignatureText("");
    setActiveSigningDoc(null);
  };

  // Payout projection states
  const [estViews, setEstViews] = useState(150000);
  const [estSponsorships, setEstSponsorships] = useState(3);
  const [estCpm, setEstCpm] = useState(25);

  const calculatedMonthlyRevenue = (estViews / 1000) * estCpm + (estSponsorships * 5000);

  // Quick Stats
  const activeDealsCount = deals.filter(d => d.status !== "Completed").length;
  const totalCompletedValue = deals.filter(d => d.status === "Completed").reduce((acc, d) => acc + d.amount, 0);
  const pipelineValue = deals.filter(d => d.status !== "Completed").reduce((acc, d) => acc + d.amount, 0);

  return (
    <div className="min-h-screen bg-[#08080a] flex flex-col md:flex-row text-white font-sans antialiased">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 flex-shrink-0 bg-[#0d0d12] border-b md:border-b-0 md:border-r border-[rgba(255,255,255,0.08)] flex flex-col justify-between p-5 md:min-h-screen z-10">
        <div className="flex flex-col gap-8 w-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-1">
            <img src={navLogoIcon} alt="OPRYX icon" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
            <span className="text-white font-extrabold text-xl tracking-wider select-none">OPRYX</span>
            <span className="text-[9px] bg-gradient-to-r from-violet to-blue text-white px-2 py-0.5 rounded-full font-mono uppercase font-bold tracking-widest ml-1">PORTAL</span>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-1 w-full">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === "overview"
                  ? "bg-gradient-to-r from-violet/20 to-blue/10 text-white border-l-2 border-violet shadow-md"
                  : "text-slate hover:text-white hover:bg-white/5"
              }`}
            >
              <LayoutDashboard className={`w-4.5 h-4.5 ${activeTab === "overview" ? "text-violet" : "text-slate"}`} />
              Overview
            </button>

            <button
              onClick={() => setActiveTab("deals")}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === "deals"
                  ? "bg-gradient-to-r from-violet/20 to-blue/10 text-white border-l-2 border-violet shadow-md"
                  : "text-slate hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-3">
                <Briefcase className={`w-4.5 h-4.5 ${activeTab === "deals" ? "text-violet" : "text-slate"}`} />
                Deals & Pipeline
              </span>
              {activeDealsCount > 0 && (
                <span className="bg-violet text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {activeDealsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("earnings")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === "earnings"
                  ? "bg-gradient-to-r from-violet/20 to-blue/10 text-white border-l-2 border-violet shadow-md"
                  : "text-slate hover:text-white hover:bg-white/5"
              }`}
            >
              <DollarSign className={`w-4.5 h-4.5 ${activeTab === "earnings" ? "text-violet" : "text-slate"}`} />
              Earnings & Analytics
            </button>

            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === "chat"
                  ? "bg-gradient-to-r from-violet/20 to-blue/10 text-white border-l-2 border-violet shadow-md"
                  : "text-slate hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-3">
                <MessageSquare className={`w-4.5 h-4.5 ${activeTab === "chat" ? "text-violet" : "text-slate"}`} />
                Manager Chat
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet"></span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab("vault")}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === "vault"
                  ? "bg-gradient-to-r from-violet/20 to-blue/10 text-white border-l-2 border-violet shadow-md"
                  : "text-slate hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-3">
                <FileText className={`w-4.5 h-4.5 ${activeTab === "vault" ? "text-violet" : "text-slate"}`} />
                Document Safe
              </span>
              {docs.some(d => d.status === "Needs Signature") && (
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === "profile"
                  ? "bg-gradient-to-r from-violet/20 to-blue/10 text-white border-l-2 border-violet shadow-md"
                  : "text-slate hover:text-white hover:bg-white/5"
              }`}
            >
              <User className={`w-4.5 h-4.5 ${activeTab === "profile" ? "text-violet" : "text-slate"}`} />
              Profile & Settings
            </button>
          </nav>
        </div>

        {/* User Profile and Sign out */}
        <div className="pt-5 border-t border-[rgba(255,255,255,0.08)] flex flex-col gap-4 mt-5 md:mt-0">
          <div 
            onClick={() => setActiveTab("profile")}
            className="flex items-center gap-3 px-1 cursor-pointer group"
          >
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt={profile.fullName} 
                className="w-9 h-9 rounded-full object-cover border border-violet/30 group-hover:border-violet"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet to-blue flex items-center justify-center font-display font-semibold text-white uppercase text-sm group-hover:scale-105 transition-transform">
                {profile.fullName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate max-w-[140px] group-hover:text-violet transition-colors">{profile.fullName}</span>
              <span className="text-[10px] text-slate font-mono uppercase tracking-wider">{profile.niche}</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2.5 text-xs text-slate hover:text-red-400 font-semibold px-2 py-1.5 rounded-lg transition-colors cursor-pointer w-full text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out of Portal
          </button>
        </div>
      </aside>

      {/* Main content body */}
      <main className="flex-1 min-w-0 overflow-y-auto relative p-6 md:p-9 bg-gradient-to-b from-[#08080a] to-[#040405]">
        {/* Top Header line */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-9 pb-5 border-b border-[rgba(255,255,255,0.05)]">
          <div>
            <div className="text-[11px] font-mono text-violet tracking-widest uppercase font-semibold">Active Client Hub</div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight mt-1">
              {activeTab === "overview" && "Welcome, Creator Partner"}
              {activeTab === "deals" && "Brand Pipeline"}
              {activeTab === "earnings" && "Financial Intelligence"}
              {activeTab === "chat" && "Sarah - Dedicated Manager"}
              {activeTab === "vault" && "Vault Storage & Onboarding"}
              {activeTab === "profile" && "Creator Settings"}
            </h1>
          </div>
          
          <div className="flex items-center gap-3 font-mono text-xs text-slate bg-white/5 border border-[rgba(255,255,255,0.06)] px-4 py-2.5 rounded-xl">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              GCP Vault Secured
            </span>
            <span className="text-white/20">|</span>
            <span>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
        </header>

        {/* Content Screens */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-8"
            >
              {/* Stats overview cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
                <div className="glass p-5.5 rounded-2xl bg-white/5 border border-white/5 hover:border-violet/20 transition-all duration-300">
                  <div className="flex justify-between items-start mb-3.5">
                    <span className="text-slate text-xs font-semibold uppercase tracking-wider">Gross Pipeline</span>
                    <span className="p-2 bg-violet/10 text-violet rounded-lg"><DollarSign className="w-4 h-4" /></span>
                  </div>
                  <div className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">${pipelineValue.toLocaleString()}</div>
                  <div className="text-[11px] text-slate mt-2.5 flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">18% month-over-month</span>
                  </div>
                </div>

                <div className="glass p-5.5 rounded-2xl bg-white/5 border border-white/5 hover:border-violet/20 transition-all duration-300">
                  <div className="flex justify-between items-start mb-3.5">
                    <span className="text-slate text-xs font-semibold uppercase tracking-wider">Active Brand Deals</span>
                    <span className="p-2 bg-blue/10 text-blue rounded-lg"><Briefcase className="w-4 h-4" /></span>
                  </div>
                  <div className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">{activeDealsCount} Contracts</div>
                  <div className="text-[11px] text-slate mt-2.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-400 font-semibold">2 awaiting final approval</span>
                  </div>
                </div>

                <div className="glass p-5.5 rounded-2xl bg-white/5 border border-white/5 hover:border-violet/20 transition-all duration-300">
                  <div className="flex justify-between items-start mb-3.5">
                    <span className="text-slate text-xs font-semibold uppercase tracking-wider">Paid Sponsor Revenue</span>
                    <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><CheckCircle2 className="w-4 h-4" /></span>
                  </div>
                  <div className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">${totalCompletedValue.toLocaleString()}</div>
                  <div className="text-[11px] text-slate mt-2.5 flex items-center gap-1">
                    <span className="text-emerald-400 font-semibold">100% payout fulfillment</span>
                  </div>
                </div>

                <div className="glass p-5.5 rounded-2xl bg-[#0e0a1a] border border-violet/20 hover:border-violet/40 transition-all duration-300">
                  <div className="flex justify-between items-start mb-3.5">
                    <span className="text-violet-200 text-xs font-semibold uppercase tracking-wider">Dedicated Manager</span>
                    <span className="p-2 bg-violet/20 text-violet-300 rounded-lg"><User className="w-4 h-4" /></span>
                  </div>
                  <div className="text-lg font-display font-bold text-white tracking-tight">Sarah Jenkins</div>
                  <div className="text-[11px] text-violet-300 mt-2.5 flex items-center gap-1.5 cursor-pointer hover:underline" onClick={() => setActiveTab("chat")}>
                    <span className="w-1.5 h-1.5 rounded-full bg-violet animate-ping"></span>
                    <span>Active in chat now</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {/* Main row grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Right / Left Side columns */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  {/* Brand Pipeline overview */}
                  <div className="glass p-6 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex flex-col">
                        <h3 className="font-display font-bold text-lg text-white">Active Campaigns</h3>
                        <span className="text-xs text-slate mt-0.5">High-end collaborations currently in negotiating or delivery phase</span>
                      </div>
                      <button 
                        onClick={() => setActiveTab("deals")}
                        className="text-xs text-violet font-semibold hover:underline flex items-center gap-1"
                      >
                        Manage pipeline <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-3">
                      {deals.slice(0, 3).map((deal) => (
                        <div 
                          key={deal.id}
                          className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-white/5 border border-white/5 rounded-xl gap-3 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-3.5">
                            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet to-blue flex items-center justify-center font-display font-bold text-sm text-white select-none">
                              {deal.brand.charAt(0)}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white">{deal.brand}</span>
                              <span className="text-xs text-slate mt-0.5">{deal.platform} integration • Due {deal.dueDate}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end gap-5">
                            <span className="text-sm font-semibold text-white font-mono">${deal.amount.toLocaleString()}</span>
                            <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-mono tracking-wide uppercase border ${
                              deal.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                              deal.status === "In Review" ? "bg-blue/10 text-blue-400 border-blue-500/20" :
                              deal.status === "Awaiting Deliverables" ? "bg-amber-400/10 text-amber-400 border-amber-500/20" :
                              "bg-white/5 text-slate border-white/10"
                            }`}>
                              {deal.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive revenue tool */}
                  <div className="glass p-6 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-violet" />
                      <h3 className="font-display font-bold text-lg text-white">OPRYX Growth & Revenue Estimator</h3>
                    </div>
                    <p className="text-xs text-slate mb-6">Drag the parameters below to project potential revenue structures managed by OPRYX systems.</p>

                    <div className="flex flex-col gap-5.5">
                      {/* Views Slider */}
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate">Estimated Average Views per Video</span>
                          <span className="text-white font-mono font-bold">{estViews.toLocaleString()} views</span>
                        </div>
                        <input 
                          type="range" 
                          min={20000} 
                          max={500000} 
                          step={10000}
                          value={estViews} 
                          onChange={(e) => setEstViews(Number(e.target.value))}
                          className="w-full accent-violet h-1 bg-white/10 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* CPM Slider */}
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate">Video Ad CPM Rate ($)</span>
                          <span className="text-white font-mono font-bold">${estCpm} per 1K views</span>
                        </div>
                        <input 
                          type="range" 
                          min={15} 
                          max={45} 
                          step={1}
                          value={estCpm} 
                          onChange={(e) => setEstCpm(Number(e.target.value))}
                          className="w-full accent-violet h-1 bg-white/10 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Sponsor Slot Count */}
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate">Brand Sponsorship Agreements per Month</span>
                          <span className="text-white font-mono font-bold">{estSponsorships} Campaign(s)</span>
                        </div>
                        <input 
                          type="range" 
                          min={1} 
                          max={8} 
                          step={1}
                          value={estSponsorships} 
                          onChange={(e) => setEstSponsorships(Number(e.target.value))}
                          className="w-full accent-violet h-1 bg-white/10 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Result */}
                      <div className="p-4.5 bg-gradient-to-r from-violet/10 to-blue/5 border border-violet/20 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 mt-1.5">
                        <div className="flex flex-col text-center sm:text-left">
                          <span className="text-[11px] font-mono tracking-widest text-violet uppercase font-semibold">Projected Monthly Revenue</span>
                          <span className="text-slate text-xs mt-1">Based on YouTube AdSense + OPRYX brand deal standard ($5k/deal value)</span>
                        </div>
                        <div className="text-3xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet to-blue font-mono">
                          ${Math.round(calculatedMonthlyRevenue).toLocaleString()}
                          <span className="text-[12px] text-slate font-sans font-normal lowercase">/mo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar Widget Feed */}
                <div className="flex flex-col gap-6">
                  {/* Urgent task list / Deliverables brief */}
                  <div className="glass p-6 rounded-2xl bg-white/5 border border-white/5 flex-1">
                    <div className="flex items-center gap-2 mb-4.5 pb-3 border-b border-white/5">
                      <CheckCircle2 className="w-5 h-5 text-blue" />
                      <h3 className="font-display font-bold text-sm text-white">Deliverables Checklist</h3>
                    </div>

                    <div className="flex flex-col gap-4">
                      {deals.slice(0, 2).map((deal) => (
                        <div key={deal.id} className="flex flex-col gap-2.5 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                          <span className="text-[11px] font-bold text-violet uppercase tracking-wider">{deal.brand} Deliverables</span>
                          <div className="flex flex-col gap-2">
                            {deal.deliverables.map((deliv, idx) => {
                              const key = `${deal.id}-${idx}`;
                              const isChecked = deliverableStatus[key] || false;
                              return (
                                <label 
                                  key={idx}
                                  className={`flex items-start gap-2.5 text-xs select-none cursor-pointer p-2 rounded-lg transition-colors ${
                                    isChecked ? "bg-white/2 text-slate" : "bg-white/5 text-white hover:bg-white/10"
                                  }`}
                                >
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleDeliverable(deal.id, idx)}
                                    className="mt-0.5 rounded border-white/10 bg-black/40 text-violet focus:ring-0 focus:ring-offset-0"
                                  />
                                  <span className={isChecked ? "line-through text-slate/60" : ""}>{deliv}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Document Action item banner */}
                  {docs.some(d => d.status === "Needs Signature") && (
                    <div className="bg-gradient-to-br from-amber-400/10 to-amber-500/5 border border-amber-500/30 p-5 rounded-2xl flex flex-col gap-3">
                      <div className="flex items-start gap-2.5 text-amber-300">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">Action Required: Document Signature</span>
                          <span className="text-[11px] text-amber-200/80 mt-1">Please review and sign your OPRYX exclusive talent representation agreement to lock down deal commissions.</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab("vault")}
                        className="btn btn-primary bg-amber-400 hover:bg-amber-500 text-black font-semibold py-2 px-4 rounded-lg text-xs transition-colors cursor-pointer w-full text-center"
                      >
                        Sign Agreement
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "deals" && (
            <motion.div
              key="deals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              {/* Header actions */}
              <div className="flex justify-between items-center flex-wrap gap-4 bg-white/5 border border-white/5 p-4.5 rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">Campaign Pipeline</span>
                  <span className="text-xs text-slate mt-0.5">Submit new brands you are speaking with or review active agreements</span>
                </div>
                <button 
                  onClick={() => setIsAddDealOpen(true)}
                  className="btn btn-primary bg-gradient-to-r from-violet to-blue hover:shadow-violet/40 hover:shadow-md py-2 px-4.5 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Submit New Deal
                </button>
              </div>

              {/* Add Deal Modal Overlay */}
              {isAddDealOpen && (
                <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="glass w-full max-w-md p-6 bg-[#0c0c10] border border-white/10 rounded-2xl relative">
                    <div className="flex justify-between items-center mb-5">
                      <h4 className="font-display font-bold text-lg text-white">Submit Brand Sponsorship Deal</h4>
                      <button onClick={() => setIsAddDealOpen(false)} className="text-slate hover:text-white cursor-pointer"><Plus className="w-5 h-5 rotate-45" /></button>
                    </div>
                    <form onSubmit={handleAddDeal} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate">Brand Name</label>
                        <input 
                          type="text" 
                          required
                          value={newBrand}
                          onChange={(e) => setNewBrand(e.target.value)}
                          placeholder="e.g. Acme Corp" 
                          className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-violet"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-slate">Deal Amount ($)</label>
                          <input 
                            type="number" 
                            required
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                            placeholder="e.g. 5000" 
                            className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-violet"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-slate">Platform</label>
                          <select 
                            value={newPlatform}
                            onChange={(e) => setNewPlatform(e.target.value as Deal["platform"])}
                            className="bg-[#0c0c10] border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-violet"
                          >
                            <option value="YouTube">YouTube</option>
                            <option value="Instagram">Instagram</option>
                            <option value="TikTok">TikTok</option>
                            <option value="Twitch">Twitch</option>
                            <option value="Newsletter">Newsletter</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate">Deliverables (comma separated)</label>
                        <input 
                          type="text" 
                          value={newDeliverables}
                          onChange={(e) => setNewDeliverables(e.target.value)}
                          placeholder="60s video ad, link in description" 
                          className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-violet"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate">Expected Run / Live Date</label>
                        <input 
                          type="text" 
                          value={newDueDate}
                          onChange={(e) => setNewDueDate(e.target.value)}
                          placeholder="August 30, 2026" 
                          className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-violet"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="btn btn-primary bg-gradient-to-r from-violet to-blue text-white py-3 rounded-xl font-bold mt-2 cursor-pointer transition-transform hover:scale-[1.01]"
                      >
                        Submit to Dedicated Manager
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Grid of Deals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {deals.map((deal) => (
                  <div key={deal.id} className="glass p-5.5 rounded-2xl bg-white/5 border border-white/5 hover:border-violet/20 transition-all flex flex-col justify-between gap-5">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <span className="w-11 h-11 rounded-xl bg-gradient-to-tr from-violet to-blue flex items-center justify-center font-display font-extrabold text-white text-lg select-none shadow-md">
                          {deal.brand.charAt(0)}
                        </span>
                        <div>
                          <h4 className="font-display font-bold text-base text-white">{deal.brand}</h4>
                          <span className="text-xs text-slate mt-0.5">{deal.platform} Collaboration</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="text-base font-bold font-mono text-white">${deal.amount.toLocaleString()}</span>
                        <span className="text-[10.5px] text-slate mt-1">Due {deal.dueDate}</span>
                      </div>
                    </div>

                    <div className="bg-black/30 border border-white/5 rounded-xl p-4">
                      <span className="text-[11px] font-bold text-violet uppercase tracking-wider block mb-2">Deliverables Brief</span>
                      <ul className="flex flex-col gap-1.5">
                        {deal.deliverables.map((deliv, index) => {
                          const key = `${deal.id}-${index}`;
                          const isChecked = deliverableStatus[key] || false;
                          return (
                            <li key={index} className="flex items-center gap-2 text-xs text-slate">
                              <span className={`w-1.5 h-1.5 rounded-full ${isChecked ? "bg-emerald-400" : "bg-violet"}`}></span>
                              <span className={isChecked ? "line-through text-slate/50" : "text-white/80"}>{deliv}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-white/5">
                      <span className="text-xs text-slate">Current status</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-mono tracking-wide uppercase border ${
                        deal.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        deal.status === "In Review" ? "bg-blue/10 text-blue-400 border-blue-500/20" :
                        deal.status === "Awaiting Deliverables" ? "bg-amber-400/10 text-amber-400 border-amber-500/20" :
                        "bg-white/5 text-slate border-white/10"
                      }`}>
                        {deal.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "earnings" && (
            <motion.div
              key="earnings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              {/* Financial cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="glass p-5.5 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-slate text-xs uppercase tracking-wider block mb-2">Fulfilled & Transferred</span>
                  <div className="text-3xl font-display font-bold text-emerald-400 font-mono">${totalCompletedValue.toLocaleString()}</div>
                  <span className="text-xs text-slate mt-2 block">Transferred cleanly into verified bank account</span>
                </div>

                <div className="glass p-5.5 rounded-2xl bg-[#0a1012] border border-blue-500/20">
                  <span className="text-slate text-xs uppercase tracking-wider block mb-2">Pending Invoices</span>
                  <div className="text-3xl font-display font-bold text-blue-400 font-mono">${deals.filter(d => d.status === "In Review" || d.status === "Awaiting Deliverables").reduce((acc, d) => acc + d.amount, 0).toLocaleString()}</div>
                  <span className="text-xs text-blue-300 mt-2 block">Manager processing deliverable verification</span>
                </div>

                <div className="glass p-5.5 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-slate text-xs uppercase tracking-wider block mb-2">Est. Average AdSense (30D)</span>
                  <div className="text-3xl font-display font-bold text-white font-mono">$3,750</div>
                  <span className="text-xs text-slate mt-2 block">Priced dynamically at $25 average CPM</span>
                </div>
              </div>

              {/* Earnings breakdown table & SVG chart */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SVG Visual Chart */}
                <div className="lg:col-span-2 glass p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between">
                  <div className="mb-5">
                    <h3 className="font-display font-bold text-lg text-white">Gross Monthly Revenue Projection</h3>
                    <span className="text-xs text-slate mt-0.5">Projected earnings with OPRYX optimization pipeline (Jul - Dec 2026)</span>
                  </div>

                  {/* Clean SVG Line/Bar Chart */}
                  <div className="w-full h-56 flex items-end justify-between gap-2.5 pt-4 px-2 select-none">
                    {[
                      { month: "Jul", value: 12200, label: "$12.2k" },
                      { month: "Aug", value: 14500, label: "$14.5k" },
                      { month: "Sep", value: 18000, label: "$18.0k" },
                      { month: "Oct", value: 21500, label: "$21.5k" },
                      { month: "Nov", value: 24200, label: "$24.2k" },
                      { month: "Dec", value: 29500, label: "$29.5k" },
                    ].map((item, idx) => {
                      const maxVal = 30000;
                      const pctHeight = (item.value / maxVal) * 100;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                          {/* Hover Tooltip tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 text-white font-mono text-[10.5px] px-2 py-1 rounded shadow-lg -translate-y-1">
                            {item.label}
                          </div>
                          
                          <div className="w-full bg-white/5 hover:bg-white/10 rounded-xl h-40 flex items-end relative overflow-hidden transition-colors border border-white/5">
                            <div 
                              style={{ height: `${pctHeight}%` }}
                              className="w-full bg-gradient-to-t from-violet to-blue rounded-b-lg transition-all duration-1000"
                            ></div>
                          </div>
                          <span className="text-xs font-semibold text-slate">{item.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sources breakdown card */}
                <div className="glass p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-bold text-base text-white mb-4 pb-2 border-b border-white/5">Revenue Sources</h3>
                    <div className="flex flex-col gap-4">
                      {[
                        { source: "Sponsorships", pct: 62, val: "$17,700", color: "bg-violet" },
                        { source: "YouTube AdSense", pct: 24, val: "$6,850", color: "bg-blue" },
                        { source: "Affiliate & Links", pct: 9, val: "$2,500", color: "bg-indigo-400" },
                        { source: "Exclusive Merch", pct: 5, val: "$1,400", color: "bg-pink-500" },
                      ].map((item, index) => (
                        <div key={index} className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-white">{item.source}</span>
                            <span className="text-slate font-mono">{item.val} ({item.pct}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div style={{ width: `${item.pct}%` }} className={`h-full ${item.color}`}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-slate leading-relaxed flex items-center gap-1.5 bg-white/2 p-3 rounded-xl">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Invoices and payments strictly conform to GCP cloud-based financial standards.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="glass border border-white/5 rounded-2xl bg-white/5 flex flex-col h-[520px] overflow-hidden"
            >
              {/* Active manager status */}
              <div className="bg-white/5 border-b border-white/5 p-4.5 flex justify-between items-center flex-wrap gap-2.5">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-violet/20 border border-violet/40 flex items-center justify-center font-display font-bold text-violet">
                      SJ
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0c0c10] absolute bottom-0 right-0"></span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">Sarah Jenkins</span>
                    <span className="text-xs text-slate mt-0.5">Head of Talent Management • Active</span>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate bg-black/40 py-1.5 px-3 rounded-lg border border-white/5">
                  Response SLA: &lt;15 mins
                </div>
              </div>

              {/* Message scroll container */}
              <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 bg-gradient-to-b from-transparent to-black/20">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${
                      msg.sender === "creator" ? "self-end items-end" : "self-start items-start"
                    }`}
                  >
                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "creator"
                        ? "bg-gradient-to-r from-violet to-blue text-white rounded-tr-none shadow-md"
                        : "bg-white/5 border border-white/5 text-slate-100 rounded-tl-none"
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate mt-1 font-mono">{msg.timestamp}</span>
                  </div>
                ))}

                {isTyping && (
                  <div className="self-start flex flex-col items-start gap-1">
                    <div className="bg-white/5 border border-white/5 p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-slate rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Send controls */}
              <form onSubmit={handleSendMessage} className="p-4.5 bg-white/2 border-t border-white/5 flex gap-3">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Sarah about payouts, active contracts, or pitch updates..." 
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-violet"
                />
                <button 
                  type="submit"
                  className="btn btn-primary bg-gradient-to-r from-violet to-blue text-white w-11 h-11 flex items-center justify-center rounded-xl cursor-pointer shadow-md hover:scale-[1.03]"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Chat Helper Prompt suggestions */}
              <div className="px-4.5 pb-4 bg-white/2 flex gap-2 flex-wrap">
                {[
                  "When is my next payout scheduled?",
                  "Can you review my Apex Gaming deal terms?",
                  "Hi Sarah, help me pitch my rates"
                ].map((promptText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setChatInput(promptText)}
                    className="text-[10px] text-slate bg-white/5 hover:bg-white/10 hover:text-white border border-white/5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "vault" && (
            <motion.div
              key="vault"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              {/* Vault Sub-tab headers */}
              <div className="flex gap-2 p-1 bg-white/5 border border-white/5 rounded-xl self-start">
                <button
                  onClick={() => setVaultSubTab("compliance")}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                    vaultSubTab === "compliance"
                      ? "bg-violet text-white shadow-md"
                      : "text-slate hover:text-white"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Compliance Onboarding
                </button>
                <button
                  onClick={() => setVaultSubTab("encrypted")}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                    vaultSubTab === "encrypted"
                      ? "bg-violet text-white shadow-md"
                      : "text-slate hover:text-white"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  Secure Cryptographic Locker
                </button>
              </div>

              {vaultSubTab === "compliance" ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Document list left */}
                  <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="glass p-5 rounded-2xl bg-white/5 border border-white/5">
                      <h3 className="font-display font-bold text-sm text-white mb-3">Onboarding Compliance</h3>
                      <p className="text-xs text-slate leading-relaxed">OPRYX requires critical tax forms and talent representation paperwork to be countersigned electronically prior to direct deposits.</p>
                    </div>

                    <div className="flex flex-col gap-3">
                      {docs.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => setActiveSigningDoc(doc)}
                          className={`glass p-4.5 rounded-xl text-left border transition-all cursor-pointer ${
                            activeSigningDoc?.id === doc.id
                              ? "bg-violet/10 border-violet"
                              : "bg-white/5 border-white/5 hover:border-white/10"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold text-violet uppercase tracking-wider">{doc.type}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${
                              doc.status === "Signed"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-amber-400/10 text-amber-400 border-amber-500/20"
                            }`}>
                              {doc.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white mb-1.5">{doc.name}</h4>
                          {doc.signedDate && (
                            <span className="text-[10px] text-slate font-mono">Signed on {doc.signedDate}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Document Content / Sign Box Right */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    {activeSigningDoc ? (
                      <div className="glass p-6 rounded-2xl bg-[#0c0c10] border border-white/5 flex flex-col gap-5">
                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                          <div>
                            <span className="text-[11px] font-mono text-violet tracking-widest uppercase font-semibold">Vault Document Preview</span>
                            <h3 className="font-display font-bold text-base text-white mt-0.5">{activeSigningDoc.name}</h3>
                          </div>
                          <span className="text-xs text-slate font-mono">{activeSigningDoc.type}</span>
                        </div>

                        {/* Scrollable Doc content */}
                        <div className="bg-black/50 border border-white/5 rounded-xl p-5 h-64 overflow-y-auto text-xs text-slate leading-relaxed font-mono whitespace-pre-line">
                          {activeSigningDoc.content}
                        </div>

                        {/* Sign Box controls */}
                        {activeSigningDoc.status === "Needs Signature" ? (
                          <div className="p-5 bg-gradient-to-br from-violet/15 to-blue/5 border border-violet/20 rounded-xl flex flex-col gap-4.5">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-white font-bold">Sign Electronically</label>
                              <span className="text-[11px] text-slate">Type your full legal name below to bind your digital signature to this agreement.</span>
                            </div>
                            
                            <div className="flex gap-3 flex-col sm:flex-row">
                              <input 
                                type="text" 
                                value={signatureText}
                                onChange={(e) => setSignatureText(e.target.value)}
                                placeholder="Type your name to sign (e.g. Alex Carter)"
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm font-mono focus:outline-none focus:border-violet"
                              />
                              <button
                                onClick={handleSignDocument}
                                disabled={!signatureText.trim()}
                                className="btn btn-primary bg-gradient-to-r from-violet to-blue text-white hover:scale-[1.02] active:scale-[0.98] transition-transform py-3 px-6 rounded-xl text-xs font-bold tracking-wide flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:scale-100"
                              >
                                <FileSignature className="w-4 h-4" />
                                Sign & Commit
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400">
                            <Check className="w-5 h-5 flex-shrink-0" />
                            <span className="text-xs">This document is successfully signed, verified, and locked inside our GCP compliance vault.</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="glass p-12 rounded-2xl bg-white/2 border border-white/5 flex flex-col items-center text-center justify-center h-full gap-3 text-slate">
                        <FileText className="w-12 h-12 text-slate-500 mb-2" />
                        <span className="font-display font-semibold text-white text-sm">Select a compliance document</span>
                        <span className="text-xs max-w-sm">Click on any file from the secure manager registry in the left column to view terms or complete your signature requirements.</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* SECURE ENCRYPTED LOCKER VIEW */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* File upload form and registry lists */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    {/* Cryptographic Encryption form */}
                    <div className="glass p-5 rounded-2xl bg-[#0c0c10] border border-white/5 flex flex-col gap-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                        <UploadCloud className="w-5 h-5 text-violet" />
                        <div>
                          <h3 className="font-display font-bold text-sm text-white">Encrypt & Upload Document</h3>
                          <p className="text-[10px] text-slate">Your content is encrypted client-side using strong cryptographic XOR masking.</p>
                        </div>
                      </div>

                      <form onSubmit={handleEncryptAndStore} className="flex flex-col gap-3.5">
                        {/* Drag and drop zone */}
                        <div 
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center text-center justify-center cursor-pointer transition-all ${
                            dragActive 
                              ? "border-violet bg-violet/10" 
                              : "border-white/10 hover:border-white/20 bg-white/2"
                          }`}
                        >
                          <input 
                            type="file" 
                            id="file-upload-input" 
                            className="hidden" 
                            accept=".txt,.json,.md,.html,.css,.js,.ts"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileUpload(e.target.files[0]);
                              }
                            }}
                          />
                          <label htmlFor="file-upload-input" className="cursor-pointer w-full flex flex-col items-center">
                            <UploadCloud className="w-7 h-7 text-slate-500 mb-1.5" />
                            <span className="text-xs font-semibold text-white block mb-0.5">Drag & Drop File Here</span>
                            <span className="text-[10px] text-slate font-mono">Supports txt, md, json, etc. Or write below.</span>
                          </label>
                        </div>

                        {/* Title input */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate font-semibold uppercase tracking-wider">Document Name</label>
                          <input 
                            type="text"
                            placeholder="e.g. Campaign_Rates.txt"
                            value={newEncDocName}
                            onChange={(e) => setNewEncDocName(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-violet font-mono"
                          />
                        </div>

                        {/* Text Area for manual text content */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate font-semibold uppercase tracking-wider">Document Plaintext Content</label>
                          <textarea 
                            rows={3}
                            placeholder="Write or paste your private notes, campaign details, or deal parameters here..."
                            value={newEncDocContent}
                            onChange={(e) => setNewEncDocContent(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-violet font-mono resize-none"
                          />
                        </div>

                        {/* Specific Email and Password target */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate font-semibold uppercase tracking-wider block truncate">Recipient (Target Email)</label>
                            <input 
                              type="email"
                              placeholder="e.g. partner@opryx.com"
                              value={newEncDocEmail}
                              onChange={(e) => setNewEncDocEmail(e.target.value)}
                              className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-violet font-mono"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate font-semibold uppercase tracking-wider">Specific Password</label>
                            <div className="relative">
                              <input 
                                type={showEncFormPass ? "text" : "password"}
                                placeholder="Key Code"
                                value={newEncDocPass}
                                onChange={(e) => setNewEncDocPass(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl p-2.5 pr-8.5 text-xs text-white focus:outline-none focus:border-violet font-mono w-full"
                              />
                              <button
                                type="button"
                                onClick={() => setShowEncFormPass(!showEncFormPass)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate hover:text-white cursor-pointer"
                              >
                                {showEncFormPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {uploadError && (
                          <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{uploadError}</span>
                          </div>
                        )}

                        {uploadSuccess && (
                          <div className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            <span>Document encrypted and saved!</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          className="btn btn-primary bg-gradient-to-r from-violet to-blue text-white rounded-xl py-2.5 text-xs font-bold cursor-pointer hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
                        >
                          <Lock className="w-4 h-4" />
                          Encrypt & Save to Locker
                        </button>
                      </form>
                    </div>

                    {/* Registry list */}
                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider px-1">🔒 Encrypted Safe Registry ({encryptedDocs.length})</h4>
                      {encryptedDocs.length === 0 ? (
                        <div className="p-8 text-center bg-white/2 border border-white/5 rounded-xl text-xs text-slate">
                          No encrypted files present. Upload a file above.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2.5">
                          {encryptedDocs.map((item) => (
                            <div 
                              key={item.id}
                              className={`glass p-3.5 rounded-xl flex justify-between items-center border transition-all ${
                                selectedEncDoc?.id === item.id 
                                  ? "bg-violet/10 border-violet/50" 
                                  : "bg-white/5 border-white/5 hover:border-white/10"
                              }`}
                            >
                              <button
                                onClick={() => {
                                  setSelectedEncDoc(item);
                                  setDecryptedFileText(null);
                                  setDecryptEmail("");
                                  setDecryptPass("");
                                  setDecryptionError("");
                                }}
                                className="flex-1 text-left cursor-pointer flex gap-3 items-center min-w-0"
                              >
                                <div className="p-2 bg-black/40 rounded-lg text-slate-400 flex-shrink-0">
                                  <Lock className="w-4 h-4 text-violet" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                                  <div className="flex items-center gap-2 text-[10px] text-slate mt-0.5 font-mono">
                                    <span>{item.fileSize}</span>
                                    <span>•</span>
                                    <span className="truncate max-w-[120px]">For: {item.targetEmail}</span>
                                  </div>
                                </div>
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm("Are you sure you want to permanently delete this encrypted document? This cannot be undone.")) {
                                    setEncryptedDocs(prev => prev.filter(d => d.id !== item.id));
                                    if (selectedEncDoc?.id === item.id) {
                                      setSelectedEncDoc(null);
                                      setDecryptedFileText(null);
                                    }
                                  }
                                }}
                                className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-white/5 cursor-pointer flex-shrink-0 transition-colors ml-2"
                                title="Delete Document"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Decryption pane right */}
                  <div className="lg:col-span-7">
                    {selectedEncDoc ? (
                      <div className="glass p-6 rounded-2xl bg-[#0c0c10] border border-white/5 flex flex-col gap-5 h-full">
                        <div className="flex justify-between items-start pb-4 border-b border-white/5">
                          <div className="min-w-0">
                            <span className="text-[10px] font-mono text-violet tracking-widest uppercase font-semibold block">CRYPTOGRAPHIC OPERATION CENTER</span>
                            <h3 className="font-display font-bold text-base text-white mt-1 truncate">{selectedEncDoc.name}</h3>
                            <span className="text-[10px] text-slate font-mono block mt-0.5">Encrypted Stream: {selectedEncDoc.encryptedContent.slice(0, 32)}...</span>
                          </div>
                          <span className="text-[11px] text-slate font-mono flex-shrink-0 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">{selectedEncDoc.fileSize}</span>
                        </div>

                        {!decryptedFileText ? (
                          /* Locked State / Input Password */
                          <div className="p-6 bg-black/40 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-5 my-2">
                            <div className="w-12 h-12 rounded-full bg-violet/10 border border-violet/20 flex items-center justify-center text-violet">
                              <Lock className="w-6 h-6 animate-pulse" />
                            </div>
                            <div className="text-center max-w-sm">
                              <h4 className="text-sm font-bold text-white mb-1">Interactive Decryption Tunnel</h4>
                              <p className="text-xs text-slate">This file is encrypted. To create a secure session and decrypt the data streams, provide the correct recipient email address and password.</p>
                            </div>

                            <form onSubmit={handleDecryptDoc} className="w-full max-w-sm flex flex-col gap-3.5">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] text-slate font-semibold uppercase tracking-wider">Authorized Recipient Email</label>
                                <input 
                                  type="email"
                                  placeholder="Enter specific email address"
                                  value={decryptEmail}
                                  onChange={(e) => setDecryptEmail(e.target.value)}
                                  className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet font-mono"
                                  required
                                />
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] text-slate font-semibold uppercase tracking-wider">Security Decryption Key</label>
                                <div className="relative">
                                  <input 
                                    type={showDecryptPass ? "text" : "password"}
                                    placeholder="Enter specific password"
                                    value={decryptPass}
                                    onChange={(e) => setDecryptPass(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-xl p-3 pr-9 text-xs text-white focus:outline-none focus:border-violet font-mono w-full"
                                    required
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowDecryptPass(!showDecryptPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-white cursor-pointer"
                                  >
                                    {showDecryptPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>

                              {decryptionError && (
                                <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                  <span>{decryptionError}</span>
                                </div>
                              )}

                              <button
                                type="submit"
                                className="btn btn-primary bg-gradient-to-r from-violet to-blue text-white rounded-xl py-3 text-xs font-bold cursor-pointer hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
                              >
                                <Unlock className="w-4 h-4" />
                                Decrypt Document
                              </button>
                            </form>
                          </div>
                        ) : (
                          /* Decrypted State */
                          <div className="flex flex-col gap-4 flex-1">
                            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400">
                              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                              <div className="text-xs">
                                <span className="font-bold block">SECURE DECRYPTED TUNNEL ESTABLISHED</span>
                                <span>Decrypted in local browser sandbox. This data is not stored in plain text anywhere.</span>
                              </div>
                            </div>

                            {/* Decrypted text viewer */}
                            <div className="bg-black/60 border border-white/5 rounded-xl p-5 h-80 overflow-y-auto text-xs text-white leading-relaxed font-mono whitespace-pre-line">
                              {decryptedFileText}
                            </div>

                            <div className="flex gap-3 flex-col sm:flex-row mt-auto pt-3 border-t border-white/5">
                              <button
                                onClick={triggerFileDownload}
                                className="btn bg-white/5 border border-white/10 text-white rounded-xl py-3 px-5 text-xs font-bold hover:bg-white/10 cursor-pointer flex-1 flex items-center justify-center gap-2"
                              >
                                <Download className="w-4 h-4" />
                                Download Plaintext File
                              </button>
                              <button
                                onClick={() => {
                                  setDecryptedFileText(null);
                                  setDecryptEmail("");
                                  setDecryptPass("");
                                }}
                                className="btn bg-violet text-white rounded-xl py-3 px-5 text-xs font-bold hover:bg-violet-600 cursor-pointer flex-1 flex items-center justify-center gap-2"
                              >
                                <Lock className="w-4 h-4" />
                                Re-Lock Session (Wipe Memory)
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="glass p-12 rounded-2xl bg-white/2 border border-white/5 flex flex-col items-center text-center justify-center h-full gap-3 text-slate">
                        <Lock className="w-12 h-12 text-slate-500 mb-2" />
                        <span className="font-display font-semibold text-white text-sm">Select an encrypted secure file</span>
                        <span className="text-xs max-w-sm">Click on any file from your locked vault registry in the left column to open the secure decryption operation panel.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Profile card preview left */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="glass p-6 rounded-3xl bg-[#0c0c10] border border-white/5 flex flex-col items-center text-center relative overflow-hidden animate-fade-in">
                  {/* Backdrop banner */}
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-violet/20 to-blue/20" />
                  
                  {/* Profile Avatar */}
                  <div className="relative mt-10 mb-4 z-10">
                    {editAvatarUrl ? (
                      <img 
                        src={editAvatarUrl} 
                        alt={editFullName} 
                        className="w-24 h-24 rounded-full object-cover border-3 border-violet shadow-xl"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet to-blue flex items-center justify-center font-display font-bold text-white text-3xl uppercase border-3 border-[#0d0d12] shadow-xl">
                        {editFullName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-1 bg-emerald-500 w-4.5 h-4.5 rounded-full border-3 border-[#0d0d12]" title="Active" />
                  </div>

                  <h3 className="font-display font-bold text-lg text-white mb-0.5">{editFullName || "Partner Creator"}</h3>
                  <p className="text-xs text-violet font-mono tracking-wider font-semibold uppercase mb-3">{editNiche || "Tech & Gaming"}</p>
                  
                  <div className="w-full bg-white/2 border border-white/5 rounded-xl p-3.5 text-xs text-slate mb-4 text-left leading-relaxed font-sans">
                    {editBio || "No bio added yet. Tell Sarah your creator achievements!"}
                  </div>

                  <div className="w-full border-t border-white/5 pt-4.5 flex flex-col gap-3 text-left">
                    <span className="text-[10px] text-slate uppercase tracking-wider font-bold block mb-1">Connected Social Handles</span>
                    
                    {editYoutube && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate flex items-center gap-1.5"><Video className="w-3.5 h-3.5 text-red-500" /> YouTube</span>
                        <span className="font-mono text-white">{editYoutube}</span>
                      </div>
                    )}
                    {editInstagram && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate flex items-center gap-1.5"><Instagram className="w-3.5 h-3.5 text-pink-500" /> Instagram</span>
                        <span className="font-mono text-white">{editInstagram}</span>
                      </div>
                    )}
                    {editTiktok && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5 text-teal-400" /> TikTok</span>
                        <span className="font-mono text-white">{editTiktok}</span>
                      </div>
                    )}
                    {editTwitch && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate flex items-center gap-1.5"><Video className="w-3.5 h-3.5 text-purple-500" /> Twitch</span>
                        <span className="font-mono text-white">{editTwitch}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass p-5 rounded-2xl bg-white/2 border border-white/5 text-xs text-slate leading-relaxed">
                  <div className="flex gap-2 items-start text-violet mb-2">
                    <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="font-bold text-white">Dynamic Brand Syncing</span>
                  </div>
                  Modifying your profile details immediately updates your manager briefs and active sponsorship portfolios. Direct deposit codes are secured using advanced GCP KMS tokenization envelopes.
                </div>
              </div>

              {/* Profile edit forms right */}
              <div className="lg:col-span-2 animate-fade-in">
                <form onSubmit={handleSaveProfile} className="glass p-6 md:p-8 rounded-3xl bg-[#0c0c10] border border-white/5 flex flex-col gap-6">
                  <div>
                    <h3 className="font-display font-bold text-lg text-white">Edit Creator Profile</h3>
                    <p className="text-xs text-slate mt-0.5">Customize your personal metadata, connected handle routes, and bank payout intelligence details.</p>
                  </div>

                  {/* Core bio and identity */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-xs font-bold text-violet uppercase tracking-wider border-b border-white/5 pb-2">1. Identity & Biography</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white font-semibold">Full Creator Name</label>
                        <input 
                          type="text"
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white font-semibold">Category Niche</label>
                        <input 
                          type="text"
                          value={editNiche}
                          onChange={(e) => setEditNiche(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white font-semibold">Custom Profile Avatar URL (Optional)</label>
                      <input 
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={editAvatarUrl}
                        onChange={(e) => setEditAvatarUrl(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white font-semibold">Biography Summary</label>
                      <textarea 
                        rows={4}
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet resize-none leading-relaxed"
                        required
                      />
                    </div>
                  </div>

                  {/* Social links handles */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-xs font-bold text-violet uppercase tracking-wider border-b border-white/5 pb-2">2. Social Channel Links</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white font-semibold">YouTube Handle</label>
                        <input 
                          type="text"
                          placeholder="@myyoutube"
                          value={editYoutube}
                          onChange={(e) => setEditYoutube(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white font-semibold">Instagram Handle</label>
                        <input 
                          type="text"
                          placeholder="myinsta"
                          value={editInstagram}
                          onChange={(e) => setEditInstagram(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white font-semibold">TikTok Handle</label>
                        <input 
                          type="text"
                          placeholder="mytiktok"
                          value={editTiktok}
                          onChange={(e) => setEditTiktok(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white font-semibold">Twitch Channel</label>
                        <input 
                          type="text"
                          placeholder="mytwitch"
                          value={editTwitch}
                          onChange={(e) => setEditTwitch(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial routing details */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-xs font-bold text-violet uppercase tracking-wider border-b border-white/5 pb-2">3. Direct Deposit Routing</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white font-semibold">Payment Method</label>
                        <select
                          value={editPayMethod}
                          onChange={(e) => setEditPayMethod(e.target.value)}
                          className="bg-[#12121a] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet"
                        >
                          <option value="Direct Deposit">Direct Deposit (ACH)</option>
                          <option value="PayPal">PayPal Business</option>
                          <option value="Stripe">Stripe Connect Account</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white font-semibold">Financial Institution</label>
                        <input 
                          type="text"
                          value={editBankName}
                          onChange={(e) => setEditBankName(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet"
                          disabled={editPayMethod !== "Direct Deposit"}
                        />
                      </div>
                    </div>

                    {editPayMethod === "Direct Deposit" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-white font-semibold">Account Number</label>
                          <input 
                            type="text"
                            value={editAccountNo}
                            onChange={(e) => setEditAccountNo(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet font-mono"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-white font-semibold">Routing Transit Number</label>
                          <input 
                            type="text"
                            value={editRoutingNo}
                            onChange={(e) => setEditRoutingNo(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {profileSaveSuccess && (
                    <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>Success! Your OPRYX Portal settings and dynamic metadata profiles have been synchronized.</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary bg-gradient-to-r from-violet to-blue text-white rounded-xl py-3 px-6 text-xs font-bold tracking-wide flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform"
                  >
                    <Save className="w-4 h-4" />
                    Save & Sync Settings
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
