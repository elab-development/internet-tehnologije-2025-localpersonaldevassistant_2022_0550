import { useState, useEffect } from 'react';
import { getAllUsers, deleteUser, updateUserRole } from '../api/admin';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [newRole, setNewRole] = useState('');

    
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    // Pretrazivanje
    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    
    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setDeleteModalOpen(true);
    };

    
    const confirmDelete = async () => {
        try {
            await deleteUser(selectedUser.id);
            setDeleteModalOpen(false);
            setSelectedUser(null);
            fetchUsers(); 
        } catch (err) {
            console.error(err);
            alert('Failed to delete user');
        }
    };

    
    const openEditModal = (user) => {
        setEditingUser(user);
        setNewRole(user.role_id);
        setEditModalOpen(true);
    };

    
    const confirmRoleChange = async () => {
        try {
            await updateUserRole(editingUser.id, newRole);
            setEditModalOpen(false);
            setEditingUser(null);
            fetchUsers(); 
        } catch (err) {
            console.error(err);
            alert('Failed to update user role');
        }
    };

    
    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-600';
            case 'standard_user':
                return 'bg-blue-600';
            default:
                return 'bg-gray-600';
        }
    };

    
    const getRoleDisplayName = (role) => {
        switch (role) {
            case 'admin':
                return 'Admin';
            case 'standard_user':
                return 'User';
            default:
                return role;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-white text-xl">Loading users...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-500 text-xl">{error}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                     Users Management
                </h2>
                <span className="text-gray-400">
                    Total: {users.length} users
                </span>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-2">
                <img 
                    src="./search-icon.png" 
                    alt="Search" 
                    className="w-6 h-6"
                />
                <input
                    type="text"
                    placeholder="Search by email or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                />
            </div>

            {/* Users Table */}
            {filteredUsers.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                    No users found.
                </div>
            ) : (
                <div className="bg-zinc-700 rounded-lg border border-zinc-600 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-zinc-800 border-b border-zinc-600">
                            <tr>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">ID</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Email</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Name</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Role</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="border-b border-zinc-600 hover:bg-zinc-600 transition-colors">
                                    <td className="px-4 py-3 text-center text-white">{user.id}</td>
                                    <td className="px-4 py-3 text-center text-white">{user.email}</td>
                                    <td className="px-4 py-3 text-center text-white">{user.full_name}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-3 py-1 rounded-full text-white text-sm font-medium  ${getRoleBadgeColor(user.role_id)}`}>
                                            {getRoleDisplayName(user.role_id)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 ">
                                        <div className="flex gap-2 justify-center">
                                            {/* Edit button*/}
                                            {user.role_id === 'standard_user' && (
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700   text-white rounded text-sm transition-colors cursor-pointer"
                                                >
                                                    Edit Role
                                                </button>
                                            )}
                                            
                                            {/* Delete button */}
                                            {user.role_id === 'standard_user' && (
                                                <button
                                                    onClick={() => openDeleteModal(user)}
                                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white  rounded text-sm transition-colors cursor-pointer"
                                                >
                                                    
                                                    Delete
                                                </button>
                                            )}

                                            {/* Ako je admin*/}
                                            {user.role_id === 'admin' && (
                                                <span className="px-3 py-1 text-gray-400 text-sm italic ">
                                                    Protected
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-zinc-800 rounded-lg p-6 max-w-md w-full mx-4 border border-zinc-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12  flex items-center justify-center flex-shrink-0">
                                 <img 
                                    src="./crisis.png" 
                                    alt="Warning" 
                                    className="w-7 h-7"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-white">
                            Delete User?
                            </h3>
                        </div>
                        <p className="text-gray-300 mb-2">
                            Are you sure you want to delete <strong className="text-white">{selectedUser?.email}</strong>?
                        </p>
                        <p className="text-red-400 text-sm mb-6">
                            This will permanently delete all their chats and messages!
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Role Modal */}
            {editModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-zinc-800 rounded-lg p-6 max-w-md w-full mx-4 border border-zinc-700">
                        <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12  flex items-center justify-center flex-shrink-0">
                    <img 
                        src="./edit.png" 
                        alt="Edit" 
                        className="w-7 h-7"
                    />
                </div>
                <h3 className="text-xl font-bold text-white">
                    Edit User Role
                </h3>
            </div>
                        <p className="text-gray-300 mb-4">
                            User: <strong className="text-white">{editingUser?.email}</strong>
                        </p>
                        <label className="block text-gray-300 mb-2 font-medium">
                            Select Role:
                        </label>
                        <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="w-full px-4 py-2 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-blue-500 focus:outline-none mb-6"
                        >
                            <option value="standard_user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setEditModalOpen(false)}
                                className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRoleChange}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
