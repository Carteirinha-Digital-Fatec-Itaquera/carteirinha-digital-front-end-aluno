import PageLayout from '../../components/page/PageLayout';
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

import { TextInfoComp } from "../../components/textinfo/TextInfoComp";
import { SpacerComp } from "../../components/spacer/SpacerComp";
import { ErrorModalComp } from "../../components/ErrorModal/ErrorModalComp";
import MessageModal, { type MessageTone } from "../../components/MessageModal/MessageModal";
import { InternetWatcher } from "../../components/internetwatcher/InternetWatcher";

import { uploadImage } from "../../../api/student/uploadImage";
import { findProfile } from "../../../api/student/findProfile"; // 👈 Importamos o findProfile
import type { ErrorField } from "../../../utils/Types";
import type { Student } from "../../../domains/Student"; // 👈 Importamos o tipo Student

import uploadAvatarPlaceholder from "../../../assets/images/upload_avatar.png";

import styles from './style.module.css';

import { compressImage } from "../../../utils/imageProcessing";


export default function UploadImageScreen() {
  const navigate = useNavigate();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [studentRa, setStudentRa] = useState<string>(""); 
  
  const [message, setMessage] = useState("");
  const [errorFields, setErrorFields] = useState<ErrorField[]>([]);
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [notice, setNotice] = useState<{ tone: MessageTone; title: string; message: string; confirmText?: string; onConfirm?: () => void } | null>(null);
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



  const handleOpenCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'user');
      fileInputRef.current.click();
    }
  };

  const handleOpenGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleUpload = async () => {
    if (!imageFile) {
      setNotice({
        tone: 'warning',
        title: 'Selecione uma foto',
        message: 'Escolha uma imagem antes de confirmar o envio.',
      });
      return;
    }

    if (!studentRa) {
      setNotice({
        tone: 'info',
        title: 'Carregando informações',
        message: 'As informações do aluno ainda estão sendo carregadas. Aguarde alguns segundos e tente novamente.',
      });
      return;
    }

    setOnLoading(true);

    try {

      // console.log("Tamanho original:", (imageFile.size / 1024).toFixed(2), "KB");
      const compressedFile = await compressImage(imageFile);
      // console.log("Tamanho comprimido:", (compressedFile.size / 1024).toFixed(2), "KB");

      const result = await uploadImage(compressedFile, studentRa); 
      
      if ('ok' in result) {
        setNotice({
          tone: 'success',
          title: 'Foto enviada com sucesso',
          message: 'Sua foto foi enviada corretamente.',
          confirmText: 'OK',
          onConfirm: () => navigate('/MainMenu'),
        });
      } else {
        setMessage(result.message || "Erro ao enviar imagem.");
        setErrorFields(result.errorFields ?? []);
        setModalErrorVisible(true);
      }
    } catch {
      setMessage("Erro na conexão com o servidor.");
      setModalErrorVisible(true);
    }
    
    setOnLoading(false);
  };

  return (
    <PageLayout title="Enviar fotografia" subtitle="Use uma foto com fundo neutro, rosto centralizado e sem óculos escuros." backTo="/MainMenu" narrow><div className={styles.container}>
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

      {notice && (
        <MessageModal
          visible
          tone={notice.tone}
          title={notice.title}
          message={notice.message}
          confirmText={notice.confirmText ?? 'OK'}
          onConfirm={() => {
            const action = notice.onConfirm;
            setNotice(null);
            action?.();
          }}
        />
      )}
      

      
      <SpacerComp vertical={10} />



    <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleImageChange} 
        style={{ display: 'none' }} 
      />

      <div className={styles.box}>
        <img 
          src={imagePreview ? imagePreview : uploadAvatarPlaceholder} 
          className={imagePreview ? styles.userImage : styles.placeholderImage} 
          alt="Preview do Upload" 
        />
      </div>

      <SpacerComp vertical={15} />
      <TextInfoComp>Como deseja enviar sua foto?</TextInfoComp>
      <SpacerComp vertical={10} />

      <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
        <button 
          className={styles.button} 
          style={{ flex: 1 }} 
          onClick={handleOpenCamera}
        >
          Tirar Foto
        </button>
        <button 
          className={styles.button} 
          style={{ flex: 1 }} 
          onClick={handleOpenGallery}
        >
          Galeria
        </button>
      </div>

      <SpacerComp vertical={20} />

      <button 
        className={styles.button} 
        onClick={handleUpload} 
        disabled={onLoading || !imageFile}
        style={{ opacity: (!imageFile || onLoading) ? 0.6 : 1 }}
      >
        {onLoading ? "Enviando..." : "Confirmar Envio"}
      </button>
    </div></PageLayout>
  );
}