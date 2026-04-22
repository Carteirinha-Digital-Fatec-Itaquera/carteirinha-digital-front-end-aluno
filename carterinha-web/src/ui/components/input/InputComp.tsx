import React, { Dispatch, SetStateAction } from "react"
import { KeyboardTypeOptions, Text, TextInput, View } from "react-native"

import { styles } from "./style"

type InputProps = {
  label: string,
  placeholder: string,
  keyboardType?: KeyboardTypeOptions,
  value: string,
  onChangeText: Dispatch<SetStateAction<string>>,
}

export const InputComp = ({ label, placeholder, keyboardType = "default", value, onChangeText }: InputProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.inputField}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  )
}