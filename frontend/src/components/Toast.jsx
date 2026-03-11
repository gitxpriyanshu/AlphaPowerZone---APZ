import { FiCheckCircle, FiXCircle, FiInfo, FiX } from "react-icons/fi";

const Toast = ({ message, type, onClose }) => {
  const icons = {
    success: <FiCheckCircle className="w-5 h-5 text-green-500" />,
    error: <FiXCircle className="w-5 h-5 text-red-500" />,
    info: <FiInfo className="w-5 h-5 text-blue-500" />,
  };

  const colors = {
    success: "border-green-100 bg-green-50",
    error: "border-red-100 bg-red-50",
    info: "border-blue-100 bg-blue-50",
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg animate-slide-in-right ${colors[type]} min-w-[300px]`}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1">
        <p className="text-sm font-bold text-gray-900">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="hover:bg-black/5 p-1 rounded-lg transition-colors"
      >
        <FiX className="w-4 h-4 text-gray-400" />
      </button>
      <style
        dangerouslySetInnerHTML={{
          __html: `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in-right {
                    animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `,
        }}
      />
    </div>
  );
};

export default Toast;
