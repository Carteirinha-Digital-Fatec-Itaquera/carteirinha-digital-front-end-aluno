import { View, Text, Pressable, StyleSheet} from "react-native";
import { AntDesign as Icon } from "@expo/vector-icons";

//import Icon from 'react-native-vector-icons/MaterialIcons';

type Props = {
  icon: string;
  label: string;
  size?: "large" | "small",
  onPress?: () => void,
};

type ButtonGridProps = {
  items?: Props[];
};

export const ButtonGrid = ({ items = [] }: ButtonGridProps) => {
    return (
        <View style={styles.container}>
            {items.map((item, i) => (
                <Pressable
                    key={i}
                    style={[
                        styles.button,
                        item.size === "large" ? styles.large : styles.small
                    ]}
                    android_ripple={{ color: "ffffff30"}}
                    onPress={item.onPress}
                >
                    <Icon name={item.icon as any} size={item.size === "large" ? 40 : 28} color="#fff" />
                    <Text style={styles.label}>{item.label}</Text>
                </Pressable>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,         
    padding: 16,
  },
  button: {
    backgroundColor: "#BA1A1A",
    borderRadius: 16,
    justifyContent: "space-around",
    alignItems: "center",
    elevation: 3,
  },
  large: {
    width: "100%",
    height: 130,
  },
  small: {
    width: "48%",
    height: 100,
  },
  label: {
    color: "#fff",
    marginTop: 6,
    fontSize: 16,
    fontWeight: "600"
  }
});
