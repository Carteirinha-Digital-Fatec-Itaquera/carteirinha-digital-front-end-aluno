import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

import { TitleComp } from "../../components/title/TitleComp";
import { TextInfoComp } from "../../components/textinfo/TextInfoComp";
import { SpacerComp } from "../../components/spacer/SpacerComp";
import { ErrorModalComp } from "../../components/ErrorModal/ErrorModalComp";
import { InternetWatcher } from "../../components/internetwatcher/InternetWatcher";

import { uploadImage } from "../../../api/student/uploadImage";
import { findProfile } from "../../../api/student/findProfile"; // 👈 Importamos o findProfile
import type { ErrorField } from "../../../utils/Types";
import type { Student } from "../../../domains/Student"; // 👈 Importamos o tipo Student

import uploadAvatarPlaceholder from "../../../assets/images/upload_avatar.png";

import styles from './style.module.css';

export default function UploadImageScreen() {
  const navigate = useNavigate();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [studentRa, setStudentRa] = useState<string>(""); 
  
  const [message, setMessage] = useState("");
  const [errorFields, setErrorFields] = useState<ErrorField[]>([]);
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [onLoading, setOnLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      const result = await findProfile();
      if (result && !('code' in result)) {
        setStudentRa((result as Student).ra);
      }
    };
    fetchStudentData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleUpload = async () => {
    if (!imageFile) {
      alert("Por favor, selecione uma imagem primeiro!");
      return;
    }

    if (!studentRa) {
      alert("Carregando informações do aluno. Tente novamente em alguns segundos.");
      return;
    }

    setOnLoading(true);

    try {
      const result = await uploadImage(imageFile, studentRa); 
      
      if ('ok' in result) {
        alert("Imagem enviada com sucesso!"); 
        navigate('/MainMenu');
      } else {
        // Agora o TypeScript sabe 100% que aqui é o ApiError
        setMessage(result.message || "Erro ao enviar imagem.");
        setErrorFields(result.errorFields ?? []);
        setModalErrorVisible(true);
      }
    } catch (error) {
      setMessage("Erro na conexão com o servidor.");
      setModalErrorVisible(true);
    }
    
    setOnLoading(false);
  };

  return (
    <div className={styles.container}>
      <ErrorModalComp
        visible={modalErrorVisible}
        error={message}
        fields={errorFields?.map((val) => val.description) ?? []}
        onClose={() => {
          setMessage("");
          setErrorFields([]);
          setModalErrorVisible(false);
        }}
      />
      <InternetWatcher />
      
      <div className={styles.header}>
        <TitleComp text="Enviar Fotografia" size={18} />
        <button className={styles.backButton} onClick={() => navigate("/MainMenu")}>Voltar</button>
      </div>
      
      <SpacerComp vertical={10} />

      <input 
        type="file" 
        accept="image/*" 
        capture="user" 
        ref={fileInputRef} 
        onChange={handleImageChange} 
        style={{ display: 'none' }} 
      />

      <div className={styles.box} onClick={() => fileInputRef.current?.click()}>
        <img 
          src={imagePreview ? imagePreview : uploadAvatarPlaceholder} 
          className={imagePreview ? styles.userImage : styles.placeholderImage} 
          alt="Preview do Upload" 
        />
      </div>

      <SpacerComp vertical={15} />
      <TextInfoComp>Clique na caixa para enviar</TextInfoComp>
      <SpacerComp vertical={20} />

      <button 
        className={styles.button} 
        onClick={handleUpload} 
        disabled={onLoading}
      >
        {onLoading ? "Enviando..." : "Confirmar"}
      </button>
    </div>
  );
}