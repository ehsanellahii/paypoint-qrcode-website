"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { useLanguage } from "@/lib/language-context";
import { storage } from "@/lib/utils";
import { formatPrice } from "@/lib/api";
import { Loader2, Banknote, CreditCard } from "lucide-react";
import FormField from "@/components/FormField";
import { DialogHeader, DialogTitle } from "./ui/dialog";

interface CheckoutFormProps {
  onSuccess: () => void;
  onBack?: () => void;
}

interface CheckoutFormData {
  customerName: string;
  email: string;
  phoneNumber: string;
  pickupTime: string;
}

type PaymentMethod = "cash" | "card" | null;

const STORAGE_KEY = "persisted";

export default function CheckoutForm({ onSuccess, onBack }: CheckoutFormProps) {
  const { cart, totalPrice, clearCart } = useCart();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});
  const [step, setStep] = useState<"details" | "payment">("details");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: "",
    email: "",
    phoneNumber: "",
    pickupTime: "asap",
  });

  const generateTimeSlots = () => {
    const slots = [t.asapTime];
    const now = new Date();
    const startHour = now.getHours();
    const startMinute = now.getMinutes();

    let currentMinute = Math.ceil(startMinute / 15) * 15;
    let currentHour = startHour;

    if (currentMinute >= 60) {
      currentMinute = 0;
      currentHour += 1;
    }

    for (let i = 0; i < 16; i++) {
      const hour = currentHour + Math.floor((currentMinute + i * 15) / 60);
      const minute = (currentMinute + i * 15) % 60;

      if (hour < 23) {
        const timeStr = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(timeStr);
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  useEffect(() => {
    const savedInfo = storage.get<{
      customerName: string;
      email: string;
      phoneNumber: string;
    }>(STORAGE_KEY, { customerName: "", email: "", phoneNumber: "" });

    setFormData((prev) => ({
      ...prev,
      ...savedInfo,
    }));
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = t.nameRequired;
    }

    if (!formData.email.trim()) {
      newErrors.email = t.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.invalidEmail;
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = t.phoneRequired;
    } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = t.invalidPhone;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateForm()) {
      setStep("payment");
    }
  };

  const handleSubmit = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    setIsSubmitting(true);

    try {
      /**
       * Update this API endpoint to point to your backend order submission endpoint.
       * The orderData object contains all necessary order information.
       */
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/orders";

      // Prepare order data
      const orderData = {
        customer: {
          name: formData.customerName,
          email: formData.email,
          phone: formData.phoneNumber,
        },
        pickupTime: formData.pickupTime,
        paymentMethod: paymentMethod,
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          basePrice: item.product.currentPrice,
          customizations: item.customizations,
          notes: item.notes,
        })),
        total: totalPrice,
        orderDate: new Date().toISOString(),
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit order");
      }

      const result = await response.json();

      storage.set(STORAGE_KEY, {
        customerName: formData.customerName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      });

      clearCart();
      onSuccess();

      console.log("Order submitted successfully:", result);
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (step === "payment") {
    return (
      <>
        <DialogHeader className="p-6 pb-0 border-b-0">
          <DialogTitle className="text-3xl border-b py-8 border-gray-300 font-bold text-center">
            {t.paymentMethod}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto px-6 py-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`p-8 rounded-lg border-2 flex flex-col items-center justify-center gap-4 font-bold text-xl transition-all ${
                  paymentMethod === "cash"
                    ? "bg-[#ffc338] border-[#ffc338] text-black"
                    : "bg-white border-gray-200 text-gray-900 hover:border-gray-300"
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    paymentMethod === "cash" ? "bg-white/20" : "bg-gray-100"
                  }`}
                >
                  <Banknote className="w-8 h-8" />
                </div>
                {t.cash}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`p-8 rounded-lg border-2 flex flex-col items-center justify-center gap-4 font-bold text-xl transition-all ${
                  paymentMethod === "card"
                    ? "bg-[#ffc338] border-[#ffc338] text-black"
                    : "bg-white border-gray-200 text-gray-900 hover:border-gray-300"
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    paymentMethod === "card" ? "bg-white/20" : "bg-gray-100"
                  }`}
                >
                  <CreditCard className="w-8 h-8" />
                </div>
                {t.posCardPayment}
              </button>
            </div>
          </div>

          <div className="border-t border-gray-300 px-6 py-4 space-y-3 bg-white">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>{t.totalIncludingVAT}</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStep("details")}
                className="py-3 px-4 rounded bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors"
                disabled={isSubmitting}
              >
                {t.back}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="py-3 px-4 rounded bg-[#ffc338] text-black font-medium hover:bg-[#f0b72f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={isSubmitting || !paymentMethod}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.placingOrder}
                  </>
                ) : (
                  t.pay
                )}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DialogHeader className="p-6 pb-0 border-b-0">
        <DialogTitle className="text-3xl border-b py-8 border-gray-300 font-bold text-center">
          {t.enterDetails}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Your data</h2>

            <div className="space-y-4">
              <FormField
                id="customerName"
                label="Name"
                type="text"
                placeholder=""
                value={formData.customerName}
                onChange={(value) => handleInputChange("customerName", value)}
                error={errors.customerName}
                required
                disabled={isSubmitting}
              />

              <FormField
                id="email"
                label="Email"
                type="email"
                placeholder=""
                value={formData.email}
                onChange={(value) => handleInputChange("email", value)}
                error={errors.email}
                required
                disabled={isSubmitting}
              />

              <FormField
                id="phoneNumber"
                label="Phone number"
                type="tel"
                placeholder=""
                value={formData.phoneNumber}
                onChange={(value) => handleInputChange("phoneNumber", value)}
                error={errors.phoneNumber}
                required
                disabled={isSubmitting}
              />

              <div>
                <label
                  htmlFor="pickupTime"
                  className="block font-semibold mb-2"
                >
                  Pickup time
                </label>
                <select
                  id="pickupTime"
                  value={formData.pickupTime}
                  onChange={(e) =>
                    handleInputChange("pickupTime", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white focus:border-[#ffc338] focus:outline-none transition-colors"
                  disabled={isSubmitting}
                >
                  {timeSlots.map((slot, index) => (
                    <option key={index} value={index === 0 ? "asap" : slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 px-6 py-4 space-y-3 bg-white">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onBack}
              className="py-3 px-4 rounded bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors"
            >
              {t.back}
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="py-3 px-4 rounded bg-[#ffc338] text-black font-medium hover:bg-[#f0b72f] transition-colors"
            >
              {t.next}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
