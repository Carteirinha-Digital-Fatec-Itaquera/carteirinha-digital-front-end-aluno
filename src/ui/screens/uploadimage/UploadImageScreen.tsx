import React, { useState } from "react";
import { Text, View, Image, Alert, Pressable, TouchableOpacity, ToastAndroid } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from "../../../routes";

import { TitleComp } from "../../components/title/TitleComp";
import { TextInfoComp } from "../../components/textinfo/TextInfoComp";
import { SpacerComp } from "../../components/spacer/SpacerComp";
import { ErrorModalComp } from "../../components/ErrorModal";

import { uploadImage } from "../../../api/student/uploadImage";
import { ErrorField } from "../../../utils/Types";

import { styles } from './style';

export default function UploadImageScreen() {
  const { navigate } = useNavigation<NavigationProps>();

  const [imageUri, setImageUri] = useState<string | null>(null);
  
  const [message, setMessage] = useState("")
  const [errorFields, setErrorFields] = useState<ErrorField[]>()
  const [modalErrorVisible, setModalErrorVisible] = useState(false)
  const [onLoading, setOnLoading] = useState(false)

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function openCamera() {
    let { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Necessário permitir o uso da câmera');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
      cameraType: ImagePicker.CameraType.front,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  function imageSource() {
    Alert.alert(
      'Escolha uma das opções',
      '',
      [
        { text: 'Voltar', style: 'cancel' },
        { text: 'Câmera', onPress: openCamera },
        { text: 'Galeria', onPress: pickImage },
      ]
    );
  }

  async function handleUpload() {
    setOnLoading(true)
    const result = await uploadImage(imageUri)
    if ('ok' in result) {
      ToastAndroid.show("Imagem enviada com sucesso!", ToastAndroid.SHORT)
      navigate('MainMenu')
    } else {
      setMessage(result.message)
      setErrorFields(result.errorFields ?? [])
      setModalErrorVisible(true)
    }
    setOnLoading(false)
  }

  return (
    <View style={styles.container}>
      <ErrorModalComp
        visible={modalErrorVisible}
        error={message}
        fields={errorFields?.map((val: ErrorField) => { return val.description }) ?? []}
        onClose={() => {
          setMessage("")
          setErrorFields([])
          setModalErrorVisible(false)
        }}
      />
      <TitleComp text="Enviar Fotografia" size={18} />
      <SpacerComp horizontal={50} />
      <View style={styles.box}>
        <Pressable onPress={imageSource}>
          <Image
            source={
              imageUri
                ? { uri: imageUri }
                : require("../../../assets/images/upload_avatar.png")
            }
            style={imageUri ? styles.userImage : styles.placeholderImage}
          />
        </Pressable>
      </View>
      <TextInfoComp> Clique na caixa para enviar</TextInfoComp>
      <TouchableOpacity style={[styles.button]} onPress={handleUpload} disabled={onLoading}>
        <Text style={styles.buttonText}>Confirmar</Text>
      </TouchableOpacity>
    </View>
  );
}
