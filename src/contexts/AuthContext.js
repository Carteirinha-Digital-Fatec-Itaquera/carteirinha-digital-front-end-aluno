import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [estudante, setEstudante] = useState(null);
    const [loadingEstudante, setLoadingEstudante] = useState(true);

    useEffect(() => {
        const loadEstudante = async () => {
            try {
                const token = await AsyncStorage.getItem('@token');
                
                const decoded = jwtDecode(token);
                const estudanteRa = decoded.ra;

                if (token) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    
                    const response = await api.get(`/estudantes/encontrar-por-ra/${estudanteRa}`);
                    
                    if (response.data.status) {
                        setEstudante(response.data.content);
                    } else {
                        console.log('Erro ao buscar estudante: ', response.data.message);
                    }
                }
            } catch (err) {
                console.error('Erro ao carregar dados do estudannte:', err);
            } finally {
                setLoadingEstudante(false);
            }
        };
        loadEstudante();
    }, []);

    const login = async (token) => {
        try {
            await AsyncStorage.setItem('@token', token);

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            const decoded = jwtDecode(token);
            const estudanteRa = decoded.ra;

            const response = await api.get(`/estudantes/encontrar-por-ra/${estudanteRa}`)
            
            if (response.data.status) {
                setEstudante(response.data.content); 
            }
        } catch (err) {
            console.error('Erro ao fazer login:', err);
        } finally {
             setLoadingEstudante(false);
        }
    };

    const logout = async () => {

        await AsyncStorage.removeItem('@token');

        delete api.defaults.headers.common['Authorization'];
        setEstudante(null);
    };

    return (
        <AuthContext.Provider value={{ estudante, setEstudante, loadingEstudante, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}