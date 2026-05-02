import React, { useState } from "react";
import { View, TextInput, Text, TouchableOpacity } from "react-native";
import styles from "../styles/Styles_declararOcorrencia";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PerfilDeclararOcorrencia({ navigation }) {
	const [text_ocorrencia, setText_ocorrencia] = useState("");
	const [text_local, setText_local] = useState("Teatro josé de alencar");

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={[styles.container, { paddingTop: 40 }]}>
				
				<TouchableOpacity 
					style={styles.back_button}
					onPress={() => navigation.navigate("EventoDetalhes")}
				>
					<Text style={styles.arrow_back}>{"<"}</Text>
				</TouchableOpacity>

				<Text style={styles.title}>
					Declaração de{"\n"}Ocorrência
				</Text>

				<View style={styles.input_wrapper}>
					<View style={styles.locationContainer}>
						<FontAwesome name="map-marker" size={30} color="white" style={styles.locationIcon}/>
                        <Text style={styles.location}>{text_local}</Text>
         
                    </View>

					<Text style={styles.label_instruction}>
						Descreva sua ocorrência/feedback:
					</Text>

					<TextInput
						style={styles.input}
						value={text_ocorrencia}
						onChangeText={setText_ocorrencia}
						placeholder="Descreva o que aconteceu..."
						placeholderTextColor="white"
						multiline
					/>
				</View>

				<View style={styles.buttons}>
					<TouchableOpacity style={styles.button}>
						<Text style={styles.button_text}>Enviar</Text>
					</TouchableOpacity>
				</View>

			</View>
		</SafeAreaView>
	);
}