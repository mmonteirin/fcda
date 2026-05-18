import React from "react";
import { View, Text, TextInput } from "react-native";
import { Controller } from "react-hook-form";

export default function AppInput({
  control,
  name,
  label,
  rules,
  ...props
}) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: "#888", fontSize: 12 }}>{label}</Text>

          <TextInput
            value={value}
            onChangeText={onChange}
            {...props}
            placeholderTextColor="#555"
            style={{
              backgroundColor: "#13291d",
              color: "#fff",
              borderRadius: 12,
              padding: 14,
              marginTop: 4,
              borderWidth: error ? 1 : 0,
              borderColor: "red",
            }}
          />

          {error && (
            <Text style={{ color: "red", fontSize: 11 }}>
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}
