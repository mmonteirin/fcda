import React from "react";
import { Text } from "react-native";

export default function AppText({
  children,
  style,
  weight = "regular",
  ...rest
}) {
  let fontFamily = "PoppinsRegular";

  if (weight === "medium") fontFamily = "PoppinsMedium";
  if (weight === "bold") fontFamily = "PoppinsBold";

  return (
    <Text
      style={[
        {
          fontFamily,
          color: "#fff",
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
