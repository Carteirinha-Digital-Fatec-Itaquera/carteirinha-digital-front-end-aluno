import axios from 'axios';
//import AsyncStorage from '@react-native-async-storage/async-storage'

const api = axios.create({
    baseURL: 'http://10.0.2.2:3000/estudantes',
    //baseURL: 'http://IP_LOCAL:3000/estudantes,'
    headers: {
        'Content-Type': 'aplication/json',
    },
});

/* Interceptor para adicionar o token às requisições
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('@token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (erro) => {
    return Promise.reject(error);
});
*/

export default api;