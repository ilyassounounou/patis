// Dans votre composant Sidebar
import { Link } from "react-router-dom";

const Sidebar = ({ setToken }) => {
  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-6">Menu</h2>
        <ul>
          <li className="mb-2">
            <Link to="/" className="block py-2 px-4 rounded hover:bg-gray-700">Ajouter Produit</Link>
          </li>
          <li className="mb-2">
            <Link to="/list" className="block py-2 px-4 rounded hover:bg-gray-700">Liste Produits</Link>
          </li>
          <li className="mb-2">
            <Link to="/orders" className="block py-2 px-4 rounded hover:bg-gray-700">Commandes</Link>
          </li>
          <li className="mb-2">
            <Link to="/employers" className="block py-2 px-4 rounded hover:bg-gray-700">Employés</Link>
          </li>
          {/* Ajoutez ce lien pour les fournisseurs */}
          <li className="mb-2">
            <Link to="/fournisseurs" className="block py-2 px-4 rounded hover:bg-gray-700">Fournisseurs</Link>
          </li>
          <li className="mb-2">
            <button 
              onClick={() => setToken("")} 
              className="block w-full text-left py-2 px-4 rounded hover:bg-gray-700"
            >
              Déconnexion
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;