import React, { Dispatch, SetStateAction, useState } from "react";
import { Text, TextInput, View } from "react-native";

import { styles } from "./style";
import { labelColor } from "../../themes/Color";

type InputPasswordProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: Dispatch<SetStateAction<string>>;
};

export const InputPasswordComp = ({ label, placeholder, value, onChangeText }: InputPasswordProps) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
        <TextInput
          style={styles.inputField}
          placeholder={placeholder}
          placeholderTextColor={labelColor}
          secureTextEntry={!showPassword}
          value={value}
          onChangeText={onChangeText}
        />
    </View>
  );
};