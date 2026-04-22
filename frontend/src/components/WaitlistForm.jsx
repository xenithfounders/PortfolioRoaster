import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function WaitlistForm({ source = "hero", variant = "light" }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/waitlist`, { email, source });
      setResult(data);
      if (data.already_joined) {
        toast(`You're already on the list — #${data.position} of ${data.total}.`);
      } else {
        toast.success(`You're in. Position #${data.position}. 🔥`);
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || "Something broke. Try again.";
      toast.error(typeof msg === "string" ? msg : "Invalid email.");
    } finally {
      setLoading(false);
    }
  };

  const onDark = variant === "dark";

  if (result) {
    return (
      <div
        data-testid={`waitlist-success-${source}`}
        className={`border-2 ${onDark ? "border-[#ff4500] bg-[#0a0a0a] text-[#f5f0e8]" : "border-[#0a0a0a] bg-[#f5f0e8] text-[#0a0a0a]"} p-6 hard-shadow-accent`}
      >
        <div className="font-display text-4xl sm:text-5xl leading-none text-[#ff4500]">
          {result.already_joined ? "ALREADY IN." : "YOU'RE IN."}
        </div>
        <div className="font-serif-i italic text-xl sm:text-2xl mt-2">
          Position <span className="text-[#ff4500] not-italic">#{result.position}</span> of {result.total}.
        </div>
        <p className={`mt-3 text-sm ${onDark ? "text-[#a1a1aa]" : "text-[#6b6358]"}`}>
          We'll email you the closed-testing link the moment a slot opens. No spam. No fluff.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      data-testid={`waitlist-form-${source}`}
      className="flex flex-col sm:flex-row gap-3 w-full"
    >
      <input
        data-testid={`waitlist-email-${source}`}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@getroasted.dev"
        className="paper-input flex-1 min-w-0"
        style={onDark ? { color: "#f5f0e8", borderColor: "#f5f0e8" } : {}}
      />
      <button
        data-testid={`waitlist-submit-${source}`}
        type="submit"
        disabled={loading}
        className="btn-primary whitespace-nowrap"
      >
        {loading ? "SENDING…" : "JOIN WAITLIST →"}
      </button>
    </form>
  );
}
