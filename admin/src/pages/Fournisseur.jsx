import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { backend_url } from '../App';

const Fournisseur = ({ token }) => {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingFournisseur, setEditingFournisseur] = useState(null);
  const [selectedFournisseur, setSelectedFournisseur] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [selectedBonne, setSelectedBonne] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    category: '',
    totalBonnesAchat: 0,
    bonnesPayer: 0,
    isHidden: false
  });
  const [imageFiles, setImageFiles] = useState([]);

  // Charger les fournisseurs au montage du composant
  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const fetchFournisseurs = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/fournisseurs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFournisseurs(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des fournisseurs:', error);
      toast.error('Erreur lors du chargement des fournisseurs');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    setImageFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      imageFiles.forEach(file => {
        data.append('bonneImages', file);
      });

      if (editingFournisseur) {
        await axios.put(`${backend_url}/api/fournisseurs/${editingFournisseur._id}`, data, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Fournisseur modifié avec succès');
      } else {
        await axios.post(`${backend_url}/api/fournisseurs`, data, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Fournisseur ajouté avec succès');
      }

      setShowForm(false);
      setEditingFournisseur(null);
      setFormData({
        fullName: '',
        phone: '',
        category: '',
        totalBonnesAchat: 0,
        bonnesPayer: 0,
        isHidden: false
      });
      setImageFiles([]);
      fetchFournisseurs();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (fournisseur) => {
    setEditingFournisseur(fournisseur);
    setFormData({
      fullName: fournisseur.fullName,
      phone: fournisseur.phone,
      category: fournisseur.category,
      totalBonnesAchat: fournisseur.totalBonnesAchat,
      bonnesPayer: fournisseur.bonnesPayer,
      isHidden: fournisseur.isHidden
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur?')) {
      try {
        await axios.delete(`${backend_url}/api/fournisseurs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Fournisseur supprimé avec succès');
        fetchFournisseurs();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleToggleHidden = async (id, isCurrentlyHidden) => {
    try {
      await axios.patch(`${backend_url}/api/fournisseurs/${id}`, 
        { isHidden: !isCurrentlyHidden },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Statut du fournisseur modifié');
      fetchFournisseurs();
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      toast.error('Erreur lors de la modification');
    }
  };

  const handleAddBonne = async (id, amount, date, description, images) => {
    try {
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('date', date);
      formData.append('description', description);
      
      // Ajouter les images
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
      }
      
      await axios.post(`${backend_url}/api/fournisseurs/${id}/bonne`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Bonne d\'achat ajoutée avec succès');
      fetchFournisseurs();
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la bonne:', error);
      toast.error('Erreur lors de l\'ajout de la bonne');
      return false;
    }
  };

  

  const handlePaiement = async (id, amount, bonneId = null) => {
    try {
      await axios.post(`${backend_url}/api/fournisseurs/${id}/paiement`, 
        { amount, bonneId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Paiement enregistré');
      fetchFournisseurs();
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      toast.error('Erreur lors du paiement');
    }
  };

  const handleViewDetails = (fournisseur) => {
    setSelectedFournisseur(fournisseur);
    setShowDetails(true);
  };

  const handleViewStats = (fournisseur) => {
    setSelectedFournisseur(fournisseur);
    setShowStats(true);
  };

  const handleViewImages = (bonne) => {
    setSelectedBonne(bonne);
    setShowImagesModal(true);
  };

  const handleAddImagesToBonne = async (fournisseurId, bonneId, images) => {
    try {
      const formData = new FormData();
      
      // Ajouter les images
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
      }
      
      await axios.post(
        `${backend_url}/api/fournisseurs/${fournisseurId}/bonne/${bonneId}/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      toast.success('Images ajoutées avec succès');
      fetchFournisseurs();
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout des images:', error);
      toast.error('Erreur lors de l\'ajout des images');
      return false;
    }
  };

  const calculateWeeklyStats = (fournisseur) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyBonnes = fournisseur.bonnes.filter(bonne => 
      new Date(bonne.date) >= oneWeekAgo
    );
    
    const weeklyPaiements = fournisseur.paiements.filter(paiement => 
      new Date(paiement.date) >= oneWeekAgo
    );
    
    const totalBonnes = weeklyBonnes.reduce((sum, bonne) => sum + bonne.amount, 0);
    const totalPaiements = weeklyPaiements.reduce((sum, paiement) => sum + paiement.amount, 0);
    
    return {
      totalBonnes,
      totalPaiements,
      resteAPayer: totalBonnes - totalPaiements,
      countBonnes: weeklyBonnes.length,
      countPaiements: weeklyPaiements.length
    };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fonction pour ouvrir le modal d'ajout de bonne
  const openAddBonneModal = (fournisseur) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white p-6 rounded shadow-md w-96">
        <h3 class="text-lg font-semibold mb-4">Ajouter une Bonne d'Achat</h3>
        
        <div class="mb-4">
          <label class="block mb-2">Montant (DH):</label>
          <input 
            type="number" 
            id="bonneAmount" 
            class="w-full p-2 border rounded" 
            placeholder="Montant de la bonne"
            required
          />
        </div>
        
        <div class="mb-4">
          <label class="block mb-2">Date:</label>
          <input 
            type="date" 
            id="bonneDate" 
            class="w-full p-2 border rounded" 
            value="${new Date().toISOString().split('T')[0]}"
            required
          />
        </div>
        
        <div class="mb-4">
          <label class="block mb-2">Description (optionnel):</label>
          <textarea 
            id="bonneDescription" 
            class="w-full p-2 border rounded" 
            rows="2"
            placeholder="Description de la bonne"
          ></textarea>
        </div>
        
        <div class="mb-4">
          <label class="block mb-2">Images de la bonne:</label>
          <input 
            type="file" 
            id="bonneImages" 
            class="w-full p-2 border rounded" 
            accept="image/*"
            multiple
          />
        </div>
        
        <div class="flex justify-end gap-2">
          <button 
            type="button" 
            id="cancelBtn" 
            class="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Annuler
          </button>
          <button 
            type="button" 
            id="confirmBtn" 
            class="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Ajouter
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Gérer l'annulation
    modal.querySelector('#cancelBtn').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Gérer la confirmation
    modal.querySelector('#confirmBtn').addEventListener('click', async () => {
      const amountInput = modal.querySelector('#bonneAmount');
      const dateInput = modal.querySelector('#bonneDate');
      const descriptionInput = modal.querySelector('#bonneDescription');
      const imagesInput = modal.querySelector('#bonneImages');
      
      const amount = amountInput.value;
      const date = dateInput.value;
      const description = descriptionInput.value;
      const images = imagesInput.files;
      
      if (!amount || isNaN(amount) || !date) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      const success = await handleAddBonne(fournisseur._id, parseFloat(amount), date, description, images);
      
      if (success) {
        document.body.removeChild(modal);
      }
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-6">Gestion des Fournisseurs</h1>
      
      <button 
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Annuler' : 'Ajouter un Fournisseur'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">{editingFournisseur ? 'Modifier' : 'Ajouter'} un Fournisseur</h2>
          
          <div className="mb-4">
            <label className="block mb-2">Nom Complet:</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">Téléphone:</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">Catégorie:</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Sélectionner une catégorie</option>
              <option value="emballage">Emballage</option>
              <option value="fruits">Fruits</option>
              <option value="légumes">Légumes</option>
              <option value="viande">Viande</option>
              <option value="produits laitiers">Produits Laitiers</option>
              <option value="autres">Autres</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Images des Bonnes d'Achat:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
              multiple
            />
          </div>

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              name="isHidden"
              checked={formData.isHidden}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label>Masquer ce fournisseur</label>
          </div>

          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
            {editingFournisseur ? 'Modifier' : 'Ajouter'}
          </button>
        </form>
      )}

      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-semibold mb-4">Liste des Fournisseurs</h2>
        {fournisseurs.length === 0 ? (
          <p>Aucun fournisseur enregistré</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2">Nom</th>
                  <th className="px-4 py-2">Téléphone</th>
                  <th className="px-4 py-2">Catégorie</th>
                  <th className="px-4 py-2">Total Bonnes</th>
                  <th className="px-4 py-2">Bonnes Payées</th>
                  <th className="px-4 py-2">Reste à Payer</th>
                  <th className="px-4 py-2">Statut</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fournisseurs.map((fournisseur) => {
                  const stats = calculateWeeklyStats(fournisseur);
                  return (
                    <tr key={fournisseur._id} className={fournisseur.isHidden ? 'bg-gray-200 opacity-70' : ''}>
                      <td className="border px-4 py-2">{fournisseur.fullName}</td>
                      <td className="border px-4 py-2">{fournisseur.phone}</td>
                      <td className="border px-4 py-2">{fournisseur.category}</td>
                      <td className="border px-4 py-2">{fournisseur.totalBonnesAchat} DH</td>
                      <td className="border px-4 py-2">{fournisseur.bonnesPayer} DH</td>
                      <td className="border px-4 py-2 font-bold">{fournisseur.totalBonnesAchat - fournisseur.bonnesPayer} DH</td>
                      <td className="border px-4 py-2">{fournisseur.isHidden ? 'Masqué' : 'Visible'}</td>
                      <td className="border px-4 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button 
                            className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                            onClick={() => handleEdit(fournisseur)}
                          >
                            Modifier
                          </button>
                          <button 
                            className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                            onClick={() => handleDelete(fournisseur._id)}
                          >
                            Supprimer
                          </button>
                          <button 
                            className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
                            onClick={() => handleToggleHidden(fournisseur._id, fournisseur.isHidden)}
                          >
                            {fournisseur.isHidden ? 'Afficher' : 'Masquer'}
                          </button>
                          <button 
                            className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                            onClick={() => openAddBonneModal(fournisseur)}
                          >
                            Ajouter Bonne
                          </button>
                          <button 
                            className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                            onClick={() => {
                              const amount = prompt('Montant du paiement:');
                              if (amount && !isNaN(amount)) {
                                handlePaiement(fournisseur._id, parseFloat(amount));
                              }
                            }}
                          >
                            Paiement
                          </button>
                          <button 
                            className="bg-purple-500 text-white px-2 py-1 rounded text-sm"
                            onClick={() => handleViewDetails(fournisseur)}
                          >
                            Détails
                          </button>
                          <button 
                            className="bg-indigo-500 text-white px-2 py-1 rounded text-sm"
                            onClick={() => handleViewStats(fournisseur)}
                          >
                            Stats
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal pour afficher les détails d'un fournisseur */}
      {showDetails && selectedFournisseur && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded shadow-md max-w-4xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Détails de {selectedFournisseur.fullName}</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Historique des Bonnes d'Achat</h3>
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Montant</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Statut</th>
                    <th className="px-4 py-2">Payé</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedFournisseur.bonnes.map((bonne, index) => (
                    <tr key={index} className={bonne.isPaid ? 'bg-green-100' : 'bg-yellow-100'}>
                      <td className="border px-4 py-2">{formatDate(bonne.date)}</td>
                      <td className="border px-4 py-2">{bonne.amount} DH</td>
                      <td className="border px-4 py-2">{bonne.description || '-'}</td>
                      <td className="border px-4 py-2">{bonne.isPaid ? 'Payée' : 'En attente'}</td>
                      <td className="border px-4 py-2">{bonne.paidAmount || 0} DH</td>
                      <td className="border px-4 py-2">
                        <div className="flex flex-wrap gap-2">
                          {/* Bouton pour voir les images */}
                          <button 
                            className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                            onClick={() => handleViewImages(bonne)}
                          >
                            Voir Images
                          </button>
                          
                          {/* Bouton pour ajouter des images */}
                          <button 
                            className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.multiple = true;
                              input.onchange = async (e) => {
                                const files = e.target.files;
                                if (files.length > 0) {
                                  const success = await handleAddImagesToBonne(selectedFournisseur._id, bonne._id, files);
                                  if (success) {
                                    setShowDetails(false);
                                    handleViewDetails(selectedFournisseur);
                                  }
                                }
                              };
                              input.click();
                            }}
                          >
                            Ajouter Images
                          </button>
                          
                          {/* Bouton pour payer */}
                          {!bonne.isPaid && (
                            <button 
                              className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                              onClick={() => {
                                const amount = prompt('Montant du paiement pour cette bonne:', bonne.amount - (bonne.paidAmount || 0));
                                if (amount && !isNaN(amount)) {
                                  handlePaiement(selectedFournisseur._id, parseFloat(amount), bonne._id);
                                  setShowDetails(false);
                                }
                              }}
                            >
                              Payer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Historique des Paiements</h3>
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Montant</th>
                    <th className="px-4 py-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedFournisseur.paiements.map((paiement, index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2">{formatDate(paiement.date)}</td>
                      <td className="border px-4 py-2">{paiement.amount} DH</td>
                      <td className="border px-4 py-2">{paiement.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button 
              className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={() => setShowDetails(false)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Modal pour afficher les images d'une bonne */}
      {showImagesModal && selectedBonne && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded shadow-md max-w-4xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Images de la Bonne</h2>
            <p className="mb-4">Montant: {selectedBonne.amount} DH - Date: {formatDate(selectedBonne.date)}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {selectedBonne.images && selectedBonne.images.length > 0 ? (
                selectedBonne.images.map((image, index) => (
                  <div key={index} className="border rounded overflow-hidden">
                    <img 
                      src={`${backend_url}/uploads/${image}`} 
                      alt={`Image ${index + 1}`}
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => window.open(`${backend_url}/uploads/${image}`, '_blank')}
                    />
                    <div className="p-2 bg-gray-100 text-center">
                      <span className="text-sm">Image {index + 1}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="col-span-full text-center py-4">Aucune image disponible</p>
              )}
            </div>

            <button 
              className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={() => setShowImagesModal(false)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Modal pour afficher les statistiques */}
      {showStats && selectedFournisseur && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded shadow-md max-w-2xl w-full">
            <h2 className="text-xl font-semibold mb-4">Statistiques de {selectedFournisseur.fullName} (7 derniers jours)</h2>
            
            {(() => {
              const stats = calculateWeeklyStats(selectedFournisseur);
              return (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-100 p-4 rounded">
                    <h3 className="font-medium">Bonnes d'Achat</h3>
                    <p className="text-2xl font-bold">{stats.totalBonnes} DH</p>
                    <p>{stats.countBonnes} bonnes</p>
                  </div>
                  <div className="bg-green-100 p-4 rounded">
                    <h3 className="font-medium">Paiements</h3>
                    <p className="text-2xl font-bold">{stats.totalPaiements} DH</p>
                    <p>{stats.countPaiements} paiements</p>
                  </div>
                  <div className="bg-yellow-100 p-4 rounded col-span-2">
                    <h3 className="font-medium">Reste à Payer</h3>
                    <p className="text-2xl font-bold">{stats.resteAPayer} DH</p>
                  </div>
                </div>
              );
            })()}

            <button 
              className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={() => setShowStats(false)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fournisseur;