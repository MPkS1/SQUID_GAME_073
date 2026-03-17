// components/AttackSimulator.jsx

import { useState } from 'react';

const PHISHING_EXAMPLES = [
  {
    title: "🏦 Bank Account Verification",
    message: "Your Amazon account has suspicious activity. Verify your account immediately by clicking here before we suspend it.",
    url: "https://bit.ly/amazn-security"
  },
  {
    title: "💰 Prize Winner Scam",
    message: "Congratulations! You've won $1000 in our annual raffle. Click to claim your prize within 24 hours!",
    url: null
  },
  {
    title: "🚨 Urgent Security Alert",
    message: "URGENT: Unauthorized access detected on your PayPal account from Nigeria. Unusual activity confirmed. Verify immediately: click link below",
    url: "https://paypal-security-verify.tk"
  },
  {
    title: "💼 CEO Impersonation (BEC)",
    message: "Hi, it's me (CEO). Can you urgently send the latest client list? Need it for the board meeting in 1 hour. Reply ASAP!",
    url: null
  }
];

export function AttackSimulator({ onExample }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const selectExample = (index) => {
    setSelectedIndex(index);
    const example = PHISHING_EXAMPLES[index];
    onExample(example.message, 'email', example.url);
  };

  return (
    <div className="mt-12 p-6 bg-purple-50 border-2 border-purple-200 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-purple-900 mb-2">
        🎬 Try Attack Simulator
      </h2>
      <p className="text-sm text-purple-800 mb-4">
        Click a phishing example to see QShield AI detect it in action:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PHISHING_EXAMPLES.map((example, idx) => (
          <button
            key={idx}
            onClick={() => selectExample(idx)}
            className={`text-left p-4 rounded-lg border-2 transition-all ${
              selectedIndex === idx
                ? 'border-purple-500 bg-purple-100'
                : 'border-purple-200 bg-white hover:border-purple-400'
            }`}
          >
            <div className="font-semibold text-sm mb-1">{example.title}</div>
            <div className="text-xs text-gray-600 line-clamp-2">
              "{example.message.substring(0, 50)}..."
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
