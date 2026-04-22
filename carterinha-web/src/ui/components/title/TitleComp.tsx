import React from "react";
import { Text, Touchable, TouchableOpacity, View } from "react-native";

import { styles } from "./style";
import { AntDesign } from "@expo/vector-icons";
import { SpacerComp } from "../spacer/SpacerComp";

type TitleProps = {
  text: string,
  size?: number,
  showButton?: boolean,
  actionButton?: () => void
}

export const TitleComp = ({ text, size = 14, showButton = false, actionButton = () => { } }: TitleProps) => {
  return (
    <View style={styles.container}>
      {showButton && (
        <TouchableOpacity style={styles.button} onPress={actionButton}>
          <AntDesign name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { fontSize: size }]}>{text}</Text>
        <View style={styles.divider} />
      </View>
      {showButton && (
        <SpacerComp horizontal={22} vertical={22} />
      )}
    </View>
  )
}