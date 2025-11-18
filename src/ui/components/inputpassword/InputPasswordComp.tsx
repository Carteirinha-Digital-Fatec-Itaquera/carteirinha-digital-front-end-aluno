import React, { Dispatch, SetStateAction, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";

import { labelColor } from "../../themes/Color";

import { styles } from "./style";

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
      <View style={styles.inputField}>
        <TextInput
          style={styles.inputText}
          placeholder={placeholder}
          secureTextEntry={!showPassword}
          value={value}
          onChangeText={onChangeText}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
                <AntDesign name="eye" size={25} /> 
              ) : (
                <AntDesign name="eye-invisible" size={25} /> 
              )
            } 
        </TouchableOpacity>
      </View>
    </View>
  );
};