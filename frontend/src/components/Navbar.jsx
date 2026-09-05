import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <div className="brand">
          <span className="brand-mark">TM</span>
          <span>Task Manager</span>
        </div>
        <div className="nav-right">
          {user && (
            <span className="nav-user">
              Hi, <strong>{user.name}</strong>
            </span>
          )}
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
            <FiLogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
