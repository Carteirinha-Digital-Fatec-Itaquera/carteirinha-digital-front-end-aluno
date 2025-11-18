import { Text } from "react-native";
import { styles } from "./style";
import { ReactNode } from "react";


type TextInfoProps = {
  size?: number,
  children: ReactNode
}

export const TextInfoComp = ({ children, size = 18 }: TextInfoProps) => {
  return (
    <Text style={[styles.text, { fontSize: size }]}>
      {children}
    </Text>
  )
}