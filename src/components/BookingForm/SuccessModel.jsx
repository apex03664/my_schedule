// BookingForm/SuccessModal.jsx
import Lottie from "lottie-react";
import successAnimation from "./sujson.json";

const SuccessModal = ({  clientEmail }) => {
 

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 text-center px-4">
      <Lottie animationData={successAnimation} style={{ width: 200 }} />
      <h2 className="text-white text-2xl mt-4 font-bold">Booking Confirmed!</h2>
      <p className="text-gray-300 mt-2 text-base max-w-md">
        🎉 Thank you for booking your one-to-one counselling session. <br />
        We’ve sent a Google Meet link to your email: <strong>{clientEmail}</strong>
      </p>
      
      <p className="text-gray-400 text-sm mt-4 max-w-sm">
        We’re excited to meet your family! Let’s shape your child’s space journey together 🚀✨
      </p>
    </div>
  );
};

export default SuccessModal;
