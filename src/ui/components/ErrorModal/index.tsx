import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';

import { styles } from './style';

type Props = {
  visible: boolean;
  error: string;
  fields?: string[];
  onClose: () => void;
};

export const ErrorModalComp = ({ visible, error, fields = [], onClose }: Props) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <MaterialIcons name="error-outline" size={30} color="#B00020" />
          <Text style={styles.errorText}>{error}</Text>
          {fields.map((field) => (
            <Text key={field} style={styles.fieldText}>• {field}</Text>
          ))}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
