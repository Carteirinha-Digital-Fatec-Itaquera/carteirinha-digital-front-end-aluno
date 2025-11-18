import React from "react"
import { Text, TouchableOpacity } from "react-native"

import { styles } from "./style"

type ButtonProps = {
  text: string,
  color: string,
  action: () => void,
}

export const ButtonComp = ({ text, color, action }: ButtonProps) => {
  return (
    <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={action}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  )
}