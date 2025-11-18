import React, { useState, useRef, Dispatch, SetStateAction } from 'react';
import { View, Text, TextInput } from 'react-native';

import { styles } from './style';

type InputCodeProps = {
  label: string,
  onChangeText: Dispatch<SetStateAction<string>>
}

export const InputCodeComp = ({ label, onChangeText }: InputCodeProps) => {
  const [codeParts, setCodeParts] = useState(['', '', '', '', '', '']);

  const codeInputRefs = useRef<(TextInput | null)[]>([]);

  const handleCodeChange = (text: string, index: number) => {
    const newCodeParts = [...codeParts];
    newCodeParts[index] = text;
    setCodeParts(newCodeParts);
    onChangeText(newCodeParts.join(''));

    if (text.length === 1 && index < codeParts.length - 1) {
      codeInputRefs.current[index + 1]?.focus();
    }

    if (text.length === 0 && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.subcontainer}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <TextInput
            key={index}
            ref={(ref) => { codeInputRefs.current[index] = ref; }}
            style={styles.inputField}
            maxLength={1}
            keyboardType="number-pad"
            value={codeParts[index]}
            onChangeText={(text) => handleCodeChange(text, index)}
            selectTextOnFocus
          />
        ))}
      </View>
    </View>

  );
};