import { createContext, type ReactNode, useState } from "react"
import type UsuarioLogin from "../models/LoginStudent"
import { login } from "../services/Service"
import { Alert } from "react-native"
import LoginStudent from "../models/LoginStudent"


interface AuthContextProps {
    student: LoginStudent
    handleLogout(): void
    handleLogin(student: LoginStudent): Promise<void>
    isLoading: boolean
}

interface AuthProviderProps {
    children: ReactNode
}

export const AuthContext = createContext({} as AuthContextProps)

export function AuthProvider({ children }: AuthProviderProps) {
    const [student, setStudent] = useState<LoginStudent>({ 
        id: 0,
        ra: "",
        name: "",
        email: "",
        rg: "",
        cpf: "",
        course: "",
        period: "",
        status: "",
        admission: "",
        birthDate: "",
        dueDate: "",
        photo: "",
        qrcode: "",
    })

    const [isLoading, setIsLoading] = useState(false)

    async function handleLogin(loginStudent: LoginStudent) {
        setIsLoading(true)
        try {
        
            await login(`/estudantes/login`, loginStudent, setStudent)
            Alert.alert("Usuário foi autenticado com sucesso!", "sucesso")
        } catch (error) {
            Alert.alert("Os dados do Usuário estão inconsistentes!", "erro")
        }
        setIsLoading(false)
    }

    function handleLogout() {
        setStudent({
            id: 0,
            ra: "",
            name: "",
            email: "",
            rg: "",
            cpf: "",
            course: "",
            period: "",
            status: "",
            admission: "",
            birthDate: "",
            dueDate: "",
            photo: "",
            qrcode: "",
        })
    }

    return (
        <AuthContext.Provider value={{ student, handleLogin, handleLogout, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}