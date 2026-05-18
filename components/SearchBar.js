import React from "react";
import { View, TextInput } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import GlobalStyles from "../styles/GlobalStyles";

const styles = GlobalStyles;

export default function SearchBar({ value, onChangeText }) {
  return (
    <View style={styles.search_container}>
      <MaterialCommunityIcons name="magnify" size={24} color="#000" />
      <TextInput
        placeholder="Quais experiencias iremos viver?"
        value={value}
        onChangeText={onChangeText}
        style={styles.search_input}
      />
    </View>
  );
}
