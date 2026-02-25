const API_BASE_URL = 'http://localhost:8000';


const getToken = () => {
    const token = localStorage.getItem('token');
    return token;
};




export const getAllUsers = async () => {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }

    return await response.json();
};


export const deleteUser = async (userId) => {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to delete user');
    }

    return await response.json();
};


export const updateUserRole = async (userId, newRole) => {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
    });

    if (!response.ok) {
        throw new Error('Failed to update user role');
    }

    return await response.json();
};


export const getAIConfig = async () => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/admin/ai-config`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch AI config');
  }

  return await response.json();
};



export const updateAIModel = async (modelName) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/admin/ai-config?model_name=${modelName}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to update AI model');
  }

  return await response.json();
};
