import auth from '@/lib/axiosAuth'

export default {
    login: (username: string, password: string) => {
        return auth.post('/users/login', { username, password });
    },

    auth: () => {
        const token = localStorage.getItem('AUTH_TOKEN');
        return auth.get('/users/user', {
            headers: {
                Authorization: 'Bearer ' + token,
            }
        });
    }
}
