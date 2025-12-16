import React, { useState} from "react";
import {Text, View, Image, Alert,Pressable, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

import { NavigationProps } from "../../../routes";
import { TitleComp } from "../../components/title/TitleComp";
import { TextInfoComp } from "../../components/textinfo/TextInfoComp";
import { SpacerComp } from "../../components/spacer/SpacerComp";
import { styles } from './style';

export default function UploadImageScreen() {
  const { navigate } = useNavigation<NavigationProps>();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  console.log({imageUri});

  async function uploadImage(imageUri: string) {

  const formData = new FormData();
  formData.append('avatar', {
    uri: imageUri,
    name: 'avatar.png',
    type: 'image/png',
  } as any);

  const response = await fetch('URL_API', {
    method: 'POST',
    body: formData,
  }); 

  if (!response.ok) {
    throw new Error('Falha no upload'); 
  }

  return response;
}

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
        {text:'Voltar', style: 'cancel' },
        {text:'Câmera', onPress: openCamera},
        {text:'Galeria', onPress: pickImage},
      ]
    );
  }

  async function handleUpload() {
    if (!imageUri) {
      Alert.alert('Envie uma fotografia antes de confirmar');
      return;
    }

    try {
      setLoading(true);
      await uploadImage(imageUri);
      Alert.alert('Imagem enviada com sucesso');
    } catch (err) {
      Alert.alert('Erro ao enviar imagem');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <TitleComp text="Enviar Fotografia" size={18} />
      <SpacerComp horizontal={50}/>
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
      <TouchableOpacity style={[styles.button]} onPress={handleUpload} disabled={loading}>
        <Text style={styles.buttonText}>Confirmar</Text>
      </TouchableOpacity>
    </View>
  );
}
