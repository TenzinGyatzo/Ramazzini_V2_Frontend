import api from '@/lib/axios'

export default {
    login: (username: string, password: string) => {
        return api.post('/users/login', { username, password });
    }
}
