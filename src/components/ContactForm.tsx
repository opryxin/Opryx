import React, { useState } from "react";
import { getSupabase } from "../lib/supabase";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusMsg("");
    setStatusType("");

    const supabase = getSupabase();
    if (!supabase) {
      setStatusMsg("Couldn't connect — please email opryx.in@gmail.com directly.");
      setStatusType("error");
      return;
    }

    if (!name || !email || !message) {
      setStatusMsg("Please fill out all fields.");
      setStatusType("error");
      return;
    }

    setLoading(true);
    setStatusMsg("Sending…");

    try {
      const { error } = await supabase.from("contact_messages").insert([
        { name, email, message },
      ]);

      if (error) {
        console.error("Supabase Error:", error);
        setStatusMsg("Couldn't send right now — please email opryx.in@gmail.com directly.");
        setStatusType("error");
      } else {
        setStatusMsg("Message sent — a manager will get back to you within 1 business day.");
        setStatusType("success");
        setName("");
        setEmail("");
        setMessage("");
      }
    } catch (err) {
      console.error("Submission Error:", err);
      setStatusMsg("An unexpected error occurred. Please try again.");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="contact-form glass p-9 flex flex-col gap-4.5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.09)] rounded-[20px] backdrop-blur-md"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="cf-name" className="text-[12.5px] text-slate">
          Name
        </label>
        <input
          id="cf-name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="bg-white/5 border border-[rgba(255,255,255,0.09)] rounded-[10px] p-3 text-white text-sm focus:outline-none focus:border-violet/60"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="cf-email" className="text-[12.5px] text-slate">
          Email
        </label>
        <input
          id="cf-email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="bg-white/5 border border-[rgba(255,255,255,0.09)] rounded-[10px] p-3 text-white text-sm focus:outline-none focus:border-violet/60"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="cf-message" className="text-[12.5px] text-slate">
          Message
        </label>
        <textarea
          id="cf-message"
          name="message"
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your channel and goals"
          className="bg-white/5 border border-[rgba(255,255,255,0.09)] rounded-[10px] p-3 text-white text-sm resize-none focus:outline-none focus:border-violet/60"
        ></textarea>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary justify-center w-full rounded-[10px] py-3 text-sm font-semibold tracking-wide bg-gradient-to-r from-violet to-blue hover:scale-[1.01] active:scale-[0.99] transition-transform text-white cursor-pointer"
      >
        {loading ? "Sending..." : "Send message"}
      </button>

      {statusMsg && (
        <div
          className={`mt-2 text-xs font-semibold text-center transition-all duration-300 ${
            statusType === "error" ? "text-red-400" : "text-green-400"
          }`}
        >
          {statusMsg}
        </div>
      )}
    </form>
  );
}
