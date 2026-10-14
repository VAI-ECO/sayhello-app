import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function LocationPermissionModal({ visible, onClose, onConfirm, permission = "location" }) {
  const camera = permission === "camera";
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text accessibilityRole="header" style={styles.title}>{camera ? "Camera access" : "Find people nearby"}</Text>
          <Text style={styles.description}>{camera
            ? "Allow camera access to scan a Say Hello QR code or take a connection selfie. You can change this permission in Settings."
            : "Say Hello uses your location for nearby people, Hangouts, and the map. You can continue without it and change access in Settings later."}</Text>
          <LinearGradient colors={["#338AFF", "#00EDB4"]} style={styles.button}>
            <TouchableOpacity accessibilityRole="button" onPress={onConfirm} style={styles.touch}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </LinearGradient>
          <TouchableOpacity accessibilityRole="button" onPress={onClose} style={styles.touch}>
            <Text style={styles.skip}>Not now</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flexGrow: 1, justifyContent: "center", padding: 28, width: "100%", maxWidth: 600, alignSelf: "center" },
  title: { fontSize: 28, fontWeight: "700", color: "#18324b", marginBottom: 20 },
  description: { fontSize: 18, lineHeight: 27, color: "#425466", marginBottom: 28 },
  button: { borderRadius: 14 },
  touch: { minHeight: 48, padding: 14, alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#102b42", fontWeight: "700", fontSize: 18 },
  skip: { color: "#2468aa", fontSize: 17 },
});
