import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  getUser: () => api.get('/api/auth/user'),
  login: () => window.location.href = `${API_URL}/api/login`,
  logout: () => window.location.href = `${API_URL}/api/logout`,
}

// Posts API
export const postsAPI = {
  getPosts: (limit = 20, offset = 0) => api.get(`/api/posts?limit=${limit}&offset=${offset}`),
  createPost: (data: any) => api.post('/api/posts', data),
  getPost: (id: number) => api.get(`/api/posts/${id}`),
  likePost: (id: number) => api.post(`/api/posts/${id}/like`),
  getComments: (postId: number) => api.get(`/api/posts/${postId}/comments`),
  addComment: (postId: number, content: string) => api.post(`/api/posts/${postId}/comments`, { content }),
}

// Users API
export const usersAPI = {
  getProfile: (userId: string) => api.get(`/api/users/${userId}`),
  updateProfile: (data: any) => api.patch('/api/users/profile', data),
  getUserPosts: (userId: string) => api.get(`/api/users/${userId}/posts`),
  getUserStats: (userId: string) => api.get(`/api/users/${userId}/stats`),
  getClanMembership: () => api.get('/api/users/clan-membership'),
  followUser: (userId: string) => api.post(`/api/users/${userId}/follow`),
  unfollowUser: (userId: string) => api.delete(`/api/users/${userId}/follow`),
}

// Clans API
export const clansAPI = {
  getClans: () => api.get('/api/clans'),
  createClan: (data: any) => api.post('/api/clans', data),
  getClan: (id: number) => api.get(`/api/clans/${id}`),
  joinClan: (id: number) => api.post(`/api/clans/${id}/join`),
  getMembers: (id: number) => api.get(`/api/clans/${id}/members`),
  leaveClan: (id: number) => api.post(`/api/clans/${id}/leave`),
}

// Tournaments API
export const tournamentsAPI = {
  getTournaments: () => api.get('/api/tournaments'),
  createTournament: (data: any) => api.post('/api/tournaments', data),
  getTournament: (id: number) => api.get(`/api/tournaments/${id}`),
  joinTournament: (id: number, clanId?: number) => api.post(`/api/tournaments/${id}/join`, { clanId }),
  getParticipants: (id: number) => api.get(`/api/tournaments/${id}/participants`),
  getBracket: (id: number) => api.get(`/api/tournaments/${id}/bracket`),
}

// Chat API
export const chatAPI = {
  getRooms: () => api.get('/api/chat/rooms'),
  createRoom: (data: any) => api.post('/api/chat/rooms', data),
  getMessages: (roomId: number) => api.get(`/api/chat/rooms/${roomId}/messages`),
  sendMessage: (roomId: number, content: string) => api.post(`/api/chat/rooms/${roomId}/messages`, { content }),
}

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get('/api/notifications'),
  markAsRead: (id: number) => api.patch(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/api/notifications/read-all'),
}