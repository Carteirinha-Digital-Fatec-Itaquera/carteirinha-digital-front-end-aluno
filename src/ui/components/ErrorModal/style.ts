import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  errorText: {
    color: "#B00020",
    fontWeight: "bold",
    fontSize: 16,
    marginVertical: 10,
    textAlign: "center",
  },
  fieldText: {
    color: "#B00020",
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#B00020",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
