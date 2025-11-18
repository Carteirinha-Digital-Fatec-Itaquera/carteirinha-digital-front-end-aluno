import React from "react"
import { FlexAlignType, Text, TouchableOpacity } from "react-native"

import { styles } from "./style"
import { labelColor } from "../../themes/Color"

type TextClickableProps = {
  text: string,
  fontColor?: string,
  action: () => void,
  alignSelf?: FlexAlignType
}

export const TextClickableComp = ({ text, fontColor = labelColor, action, alignSelf = "center" }: TextClickableProps) => {
  return (
    <TouchableOpacity style={[styles.container, { alignSelf: alignSelf }]} onPress={action}>
      <Text style={[styles.text, { color: fontColor }]}>{text}</Text>
    </TouchableOpacity>
  )
}