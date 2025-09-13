// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { backend_url } from '../App';

// const Fourni = ({ token }) => {
//   const [fournisseurs, setFournisseurs] = useState([]);
//   const [selectedFournisseur, setSelectedFournisseur] = useState(null);
//   const [showDetails, setShowDetails] = useState(false);
//   const [showStats, setShowStats] = useState(false);
//   const [showBonneDetails, setShowBonneDetails] = useState(false);
//   const [selectedBonne, setSelectedBonne] = useState(null);
//   const [showImagesModal, setShowImagesModal] = useState(false);
//   const [filterCategory, setFilterCategory] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');

//   // Charger les fournisseurs au montage du composant
//   useEffect(() => {
//     fetchFournisseurs();
//   }, []);

//   const fetchFournisseurs = async () => {
//     try {
//       const response = await axios.get(`${backend_url}/api/fournisseurs`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setFournisseurs(response.data);
//     } catch (error) {
//       console.error('Erreur lors du chargement des fournisseurs:', error);
//       toast.error('Erreur lors du chargement des fournisseurs');
//     }
//   };

//   const handleViewDetails = async (fournisseur) => {
//     try {
//       const response = await axios.get(`${backend_url}/api/fournisseurs/${fournisseur._id}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setSelectedFournisseur(response.data);
//       setShowDetails(true);
//     } catch (error) {
//       console.error('Erreur lors du chargement des détails:', error);
//       toast.error('Erreur lors du chargement des détails');
//     }
//   };

//   const handleViewStats = (fournisseur) => {
//     setSelectedFournisseur(fournisseur);
//     setShowStats(true);
//   };

//   const handleViewBonneDetails = async (fournisseurId, bonneId) => {
//     try {
//       const response = await axios.get(
//         `${backend_url}/api/fournisseurs/${fournisseurId}/bonne/${bonneId}`,
//         {
//           headers: { Authorization: `Bearer ${token}` }
//         }
//       );
//       setSelectedBonne(response.data);
//       setShowBonneDetails(true);
//     } catch (error) {
//       console.error('Erreur lors du chargement des détails de la bonne:', error);
//       toast.error('Erreur lors du chargement des détails de la bonne');
//     }
//   };

//   const handleViewImages = async (bonne) => {
//     try {
//       const response = await axios.get(
//         `${backend_url}/api/fournisseurs/${selectedFournisseur._id}/bonne/${bonne._id}`,
//         {
//           headers: { Authorization: `Bearer ${token}` }
//         }
//       );
//       setSelectedBonne(response.data);
//       setShowImagesModal(true);
//     } catch (error) {
//       console.error('Erreur lors du chargement des images:', error);
//       toast.error('Erreur lors du chargement des images');
//     }
//   };

//   const handlePaiement = async (id, amount, bonneId = null) => {
//     try {
//       await axios.post(`${backend_url}/api/fournisseurs/${id}/paiement`, 
//         { amount, bonneId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success('Paiement enregistré');
//       fetchFournisseurs();
//       if (showDetails) {
//         const response = await axios.get(`${backend_url}/api/fournisseurs/${id}`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setSelectedFournisseur(response.data);
//       }
//     } catch (error) {
//       console.error('Erreur lors du paiement:', error);
//       toast.error('Erreur lors du paiement');
//     }
//   };

//   const calculateWeeklyStats = (fournisseur) => {
//     const now = new Date();
//     const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
//     const weeklyBonnes = fournisseur.bonnes.filter(bonne => 
//       new Date(bonne.date) >= oneWeekAgo
//     );
    
//     const weeklyPaiements = fournisseur.paiements.filter(paiement => 
//       new Date(paiement.date) >= oneWeekAgo
//     );
    
//     const totalBonnes = weeklyBonnes.reduce((sum, bonne) => sum + bonne.amount, 0);
//     const totalPaiements = weeklyPaiements.reduce((sum, paiement) => sum + paiement.amount, 0);
    
//     return {
//       totalBonnes,
//       totalPaiements,
//       resteAPayer: totalBonnes - totalPaiements,
//       countBonnes: weeklyBonnes.length,
//       countPaiements: weeklyPaiements.length
//     };
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('fr-FR', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getImageUrl = (image) => {
//     if (typeof image === 'object' && image.url) {
//       return image.url;
//     }
//     return `${backend_url}/uploads/${image}`;
//   };

//   // Filtrer les fournisseurs par catégorie et terme de recherche
//   const filteredFournisseurs = fournisseurs.filter(fournisseur => {
//     const matchesCategory = filterCategory ? fournisseur.category === filterCategory : true;
//     const matchesSearch = searchTerm 
//       ? fournisseur.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         fournisseur.phone.includes(searchTerm)
//       : true;
    
//     return matchesCategory && matchesSearch;
//   });

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <ToastContainer />
//       <h1 className="text-2xl font-bold mb-6">Informations des Fournisseurs</h1>
      
//       {/* Filtres */}
//       <div className="bg-white p-4 rounded shadow-md mb-6">
//         <h2 className="text-lg font-semibold mb-4">Filtres</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block mb-2">Rechercher par nom ou téléphone:</label>
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full p-2 border rounded"
//               placeholder="Nom ou téléphone..."
//             />
//           </div>
//           <div>
//             <label className="block mb-2">Filtrer par catégorie:</label>
//             <select
//               value={filterCategory}
//               onChange={(e) => setFilterCategory(e.target.value)}
//               className="w-full p-2 border rounded"
//             >
//               <option value="">Toutes les catégories</option>
//               <option value="emballage">Emballage</option>
//               <option value="fruits">Fruits</option>
//               <option value="légumes">Légumes</option>
//               <option value="viande">Viande</option>
//               <option value="produits laitiers">Produits Laitiers</option>
//               <option value="autres">Autres</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Tableau des fournisseurs */}
//       <div className="bg-white p-6 rounded shadow-md">
//         <h2 className="text-xl font-semibold mb-4">Liste des Fournisseurs</h2>
//         {filteredFournisseurs.length === 0 ? (
//           <p>Aucun fournisseur trouvé</p>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full table-auto">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="px-4 py-2">Nom</th>
//                   <th className="px-4 py-2">Téléphone</th>
//                   <th className="px-4 py-2">Catégorie</th>
//                   <th className="px-4 py-2">Total Bonnes</th>
//                   <th className="px-4 py-2">Bonnes Payées</th>
//                   <th className="px-4 py-2">Reste à Payer</th>
//                   <th className="px-4 py-2">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredFournisseurs.map((fournisseur) => {
//                   const stats = calculateWeeklyStats(fournisseur);
//                   return (
//                     <tr key={fournisseur._id} className={fournisseur.isHidden ? 'bg-gray-200 opacity-70' : ''}>
//                       <td className="border px-4 py-2">{fournisseur.fullName}</td>
//                       <td className="border px-4 py-2">{fournisseur.phone}</td>
//                       <td className="border px-4 py-2">{fournisseur.category}</td>
//                       <td className="border px-4 py-2">{fournisseur.totalBonnesAchat} DH</td>
//                       <td className="border px-4 py-2">{fournisseur.bonnesPayer} DH</td>
//                       <td className="border px-4 py-2 font-bold">{fournisseur.totalBonnesAchat - fournisseur.bonnesPayer} DH</td>
//                       <td className="border px-4 py-2">
//                         <div className="flex flex-wrap gap-2">
//                           <button 
//                             className="bg-purple-500 text-white px-2 py-1 rounded text-sm"
//                             onClick={() => handleViewDetails(fournisseur)}
//                           >
//                             Détails
//                           </button>
//                           <button 
//                             className="bg-indigo-500 text-white px-2 py-1 rounded text-sm"
//                             onClick={() => handleViewStats(fournisseur)}
//                           >
//                             Stats
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Modal pour afficher les détails d'une bonne spécifique */}
//       {showBonneDetails && selectedBonne && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white p-6 rounded shadow-md max-w-4xl w-full max-h-screen overflow-y-auto">
//             <h2 className="text-xl font-semibold mb-4">Détails de la Bonne d'Achat</h2>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//               <div>
//                 <h3 className="text-lg font-medium mb-2">Informations</h3>
//                 <div className="space-y-2">
//                   <p><strong>Montant:</strong> {selectedBonne.amount} DH</p>
//                   <p><strong>Date:</strong> {formatDate(selectedBonne.date)}</p>
//                   <p><strong>Statut:</strong> {selectedBonne.isPaid ? 'Payée' : 'En attente'}</p>
//                   <p><strong>Montant payé:</strong> {selectedBonne.paidAmount || 0} DH</p>
//                   <p><strong>Reste à payer:</strong> {selectedBonne.amount - (selectedBonne.paidAmount || 0)} DH</p>
//                   {selectedBonne.description && (
//                     <p><strong>Description:</strong> {selectedBonne.description}</p>
//                   )}
//                 </div>
//               </div>
              
//               <div>
//                 <h3 className="text-lg font-medium mb-2">Images de la Bonne</h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   {selectedBonne.images && selectedBonne.images.length > 0 ? (
//                     selectedBonne.images.map((image, index) => {
//                       const imageUrl = getImageUrl(image);
//                       return (
//                         <div key={index} className="border rounded overflow-hidden">
//                           <img 
//                             src={imageUrl}
//                             alt={`Image ${index + 1}`}
//                             className="w-full h-32 object-cover cursor-pointer"
//                             onClick={() => window.open(imageUrl, '_blank')}
//                           />
//                           <div className="p-2 bg-gray-100 text-center">
//                             <span className="text-sm">Image {index + 1}</span>
//                           </div>
//                         </div>
//                       );
//                     })
//                   ) : (
//                     <p className="col-span-2 text-center py-4">Aucune image disponible</p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <button 
//               className="bg-gray-500 text-white px-4 py-2 rounded"
//               onClick={() => setShowBonneDetails(false)}
//             >
//               Fermer
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Modal pour afficher les détails d'un fournisseur */}
//       {showDetails && selectedFournisseur && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white p-6 rounded shadow-md max-w-6xl w-full max-h-screen overflow-y-auto">
//             <h2 className="text-xl font-semibold mb-4">Détails de {selectedFournisseur.fullName}</h2>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//               <div className="bg-blue-50 p-4 rounded">
//                 <h3 className="text-lg font-medium mb-2">Informations du Fournisseur</h3>
//                 <div className="space-y-2">
//                   <p><strong>Nom:</strong> {selectedFournisseur.fullName}</p>
//                   <p><strong>Téléphone:</strong> {selectedFournisseur.phone}</p>
//                   <p><strong>Catégorie:</strong> {selectedFournisseur.category}</p>
//                   <p><strong>Total des bonnes:</strong> {selectedFournisseur.totalBonnesAchat} DH</p>
//                   <p><strong>Total payé:</strong> {selectedFournisseur.bonnesPayer} DH</p>
//                   <p><strong>Reste à payer:</strong> {selectedFournisseur.totalBonnesAchat - selectedFournisseur.bonnesPayer} DH</p>
//                 </div>
//               </div>
              
//               <div className="bg-green-50 p-4 rounded">
//                 <h3 className="text-lg font-medium mb-2">Statistiques de la semaine</h3>
//                 {(() => {
//                   const stats = calculateWeeklyStats(selectedFournisseur);
//                   return (
//                     <div className="space-y-2">
//                       <p><strong>Bonnes cette semaine:</strong> {stats.totalBonnes} DH ({stats.countBonnes} bonnes)</p>
//                       <p><strong>Paiements cette semaine:</strong> {stats.totalPaiements} DH ({stats.countPaiements} paiements)</p>
//                       <p><strong>Reste à payer cette semaine:</strong> {stats.resteAPayer} DH</p>
//                     </div>
//                   );
//                 })()}
//               </div>
//             </div>
            
//             <div className="mb-6">
//               <h3 className="text-lg font-medium mb-2">Historique des Bonnes d'Achat</h3>
//               <table className="min-w-full">
//                 <thead>
//                   <tr className="bg-gray-100">
//                     <th className="px-4 py-2">Date</th>
//                     <th className="px-4 py-2">Montant</th>
//                     <th className="px-4 py-2">Description</th>
//                     <th className="px-4 py-2">Statut</th>
//                     <th className="px-4 py-2">Payé</th>
//                     <th className="px-4 py-2">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {selectedFournisseur.bonnes && selectedFournisseur.bonnes.map((bonne, index) => (
//                     <tr key={index} className={bonne.isPaid ? 'bg-green-100' : 'bg-yellow-100'}>
//                       <td className="border px-4 py-2">{formatDate(bonne.date)}</td>
//                       <td className="border px-4 py-2">{bonne.amount} DH</td>
//                       <td className="border px-4 py-2">{bonne.description || '-'}</td>
//                       <td className="border px-4 py-2">{bonne.isPaid ? 'Payée' : 'En attente'}</td>
//                       <td className="border px-4 py-2">{bonne.paidAmount || 0} DH</td>
//                       <td className="border px-4 py-2">
//                         <div className="flex flex-wrap gap-2">
//                           <button 
//                             className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
//                             onClick={() => handleViewBonneDetails(selectedFournisseur._id, bonne._id)}
//                           >
//                             Voir Détails
//                           </button>
                          
//                           {bonne.images && bonne.images.length > 0 && (
//                             <button 
//                               className="bg-purple-500 text-white px-2 py-1 rounded text-sm"
//                               onClick={() => handleViewImages(bonne)}
//                             >
//                               Voir Images
//                             </button>
//                           )}
                          
//                           {!bonne.isPaid && (
//                             <button 
//                               className="bg-green-500 text-white px-2 py-1 rounded text-sm"
//                               onClick={() => {
//                                 const amount = prompt('Montant du paiement pour cette bonne:', bonne.amount - (bonne.paidAmount || 0));
//                                 if (amount && !isNaN(amount)) {
//                                   handlePaiement(selectedFournisseur._id, parseFloat(amount), bonne._id);
//                                 }
//                               }}
//                             >
//                               Payer
//                             </button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             <div className="mb-6">
//               <h3 className="text-lg font-medium mb-2">Historique des Paiements</h3>
//               <table className="min-w-full">
//                 <thead>
//                   <tr className="bg-gray-100">
//                     <th className="px-4 py-2">Date</th>
//                     <th className="px-4 py-2">Montant</th>
//                     <th className="px-4 py-2">Description</th>
//                     <th className="px-4 py-2">Bonne associée</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {selectedFournisseur.paiements && selectedFournisseur.paiements.map((paiement, index) => (
//                     <tr key={index}>
//                       <td className="border px-4 py-2">{formatDate(paiement.date)}</td>
//                       <td className="border px-4 py-2">{paiement.amount} DH</td>
//                       <td className="border px-4 py-2">{paiement.description || '-'}</td>
//                       <td className="border px-4 py-2">
//                         {paiement.bonneId ? 
//                           (selectedFournisseur.bonnes.find(b => b._id === paiement.bonneId)?.amount || 'N/A') + ' DH' : 
//                           'Général'
//                         }
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             <button 
//               className="bg-gray-500 text-white px-4 py-2 rounded"
//               onClick={() => setShowDetails(false)}
//             >
//               Fermer
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Modal pour afficher les images d'une bonne */}
//       {showImagesModal && selectedBonne && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white p-6 rounded shadow-md max-w-4xl w-full max-h-screen overflow-y-auto">
//             <h2 className="text-xl font-semibold mb-4">Images de la Bonne</h2>
//             <p className="mb-4">Montant: {selectedBonne.amount} DH - Date: {formatDate(selectedBonne.date)}</p>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
//               {selectedBonne.images && selectedBonne.images.length > 0 ? (
//                 selectedBonne.images.map((image, index) => {
//                   const imageUrl = getImageUrl(image);
//                   return (
//                     <div key={index} className="border rounded overflow-hidden">
//                       <img 
//                         src={imageUrl}
//                         alt={`Image ${index + 1}`}
//                         className="w-full h-48 object-cover cursor-pointer"
//                         onClick={() => window.open(imageUrl, '_blank')}
//                       />
//                       <div className="p-2 bg-gray-100 text-center">
//                         <span className="text-sm">Image {index + 1}</span>
//                       </div>
//                     </div>
//                   );
//                 })
//               ) : (
//                 <p className="col-span-full text-center py-4">Aucune image disponible</p>
//               )}
//             </div>

//             <button 
//               className="bg-gray-500 text-white px-4 py-2 rounded"
//               onClick={() => setShowImagesModal(false)}
//             >
//               Fermer
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Modal pour afficher les statistiques */}
//       {showStats && selectedFournisseur && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white p-6 rounded shadow-md max-w-2xl w-full">
//             <h2 className="text-xl font-semibold mb-4">Statistiques de {selectedFournisseur.fullName} (7 derniers jours)</h2>
            
//             {(() => {
//               const stats = calculateWeeklyStats(selectedFournisseur);
//               return (
//                 <div className="grid grid-cols-2 gap-4 mb-6">
//                   <div className="bg-blue-100 p-4 rounded">
//                     <h3 className="font-medium">Bonnes d'Achat</h3>
//                     <p className="text-2xl font-bold">{stats.totalBonnes} DH</p>
//                     <p>{stats.countBonnes} bonnes</p>
//                   </div>
//                   <div className="bg-green-100 p-4 rounded">
//                     <h3 className="font-medium">Paiements</h3>
//                     <p className="text-2xl font-bold">{stats.totalPaiements} DH</p>
//                     <p>{stats.countPaiements} paiements</p>
//                   </div>
//                   <div className="bg-yellow-100 p-4 rounded col-span-2">
//                     <h3 className="font-medium">Reste à Payer</h3>
//                     <p className="text-2xl font-bold">{stats.resteAPayer} DH</p>
//                   </div>
//                 </div>
//               );
//             })()}

//             <button 
//               className="bg-gray-500 text-white px-4 py-2 rounded"
//               onClick={() => setShowStats(false)}
//             >
//               Fermer
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Fourni;