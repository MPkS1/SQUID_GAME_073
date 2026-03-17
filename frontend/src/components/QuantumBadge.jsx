// components/QuantumBadge.jsx

export function QuantumBadge({ quantumRiskLevel = 'LOW' }) {
  const getRiskStyles = () => {
    switch (quantumRiskLevel) {
      case 'HIGH':
        return 'bg-red-100 text-red-900 border-red-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-900 border-yellow-300';
      case 'LOW':
      default:
        return 'bg-green-100 text-green-900 border-green-300';
    }
  };

  const getRiskExplanation = () => {
    switch (quantumRiskLevel) {
      case 'HIGH':
        return "This message requests password or financial data. RSA encryption protecting it is vulnerable to Shor's Algorithm. Quantum computers will break it in 2035-2040.";
      case 'MEDIUM':
        return "Quantum computers could weaken (but not break) AES encryption using Grover's Algorithm. Post-quantum standards like Kyber already exist.";
      case 'LOW':
      default:
        return "No sensitive data types detected. Quantum computing threat is minimal for generic phishing messages.";
    }
  };

  return (
    <div className={`border-l-4 p-5 rounded-lg ${getRiskStyles()} shadow-sm`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">⚛️</span>
        <div className="flex-1">
          <h3 className="font-bold text-sm mb-1">Quantum Computing Risk</h3>
          <p className="text-sm leading-relaxed mb-2">
            {getRiskExplanation()}
          </p>
          <p className="text-xs font-semibold opacity-75">
            ⏰ Timeline: RSA vulnerable 2035-2040
          </p>
        </div>
      </div>
    </div>
  );
}
