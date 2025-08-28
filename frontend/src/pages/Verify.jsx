import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Verify = () => {
  const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Vérification du paiement en cours...");

  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");

  const verifyPayment = async () => {
    try {
      // Récupération du token local si token du contexte non disponible
      const localToken = localStorage.getItem("token");
      const finalToken = token || localToken;

      if (!finalToken) {
        setMessage("Non autorisé. Veuillez vous connecter.");
        return;
      }

      const response = await axios.post(
        `${backendUrl}/api/order/verifyStripe`,
        { success, orderId },
        { headers: { token: finalToken } }
      );

      if (response.data.success) {
        setCartItems({});
        setMessage("🎉 Félicitations ! Votre commande a été validée avec succès.");
        setTimeout(() => {
          navigate("/orders");
        }, 3000);
      } else {
        setMessage("❌ Paiement échoué. Redirection vers le panier...");
        setTimeout(() => {
          navigate("/cart");
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Erreur lors de la vérification du paiement.");
      setMessage("Une erreur est survenue lors de la vérification.");
    }
  };

  useEffect(() => {
    verifyPayment();
  }, []); // appel unique à la vérification à l'initialisation

  return (
    <div className="w-full h-[60vh] flex items-center justify-center text-center px-4">
      <div className={`text-lg sm:text-2xl font-semibold ${message.includes('Félicitations') ? 'text-green-700' : 'text-red-700'}`}>
        {message}
      </div>
    </div>
  );
};

export default Verify;
