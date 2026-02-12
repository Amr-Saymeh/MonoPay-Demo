import React, { useEffect, useState } from "react";

import { onValue, push, ref, set } from "firebase/database";
import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { db } from "../../src/firebaseConfig";

type Message = {
  id: string;
  text: string;
  time: number;
};

export default function HomeScreen() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const messagesRef = ref(db, "messages");

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list: Message[] = Object.entries(data).map(
        ([id, value]: any) => ({
          id,
          ...value,
        })
      );

      setMessages(list);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!text.trim()) return;

    const newRef = push(ref(db, "messages"));
    await set(newRef, {
      text,
      time: Date.now(),
    });

    setText("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Realtime Messages</Text>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.message}>{item.text}</Text>
        )}
      />

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Type message"
      />

      <Button title="Send" onPress={sendMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 50 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  message: { padding: 5 },
  input: {
    borderWidth: 1,
    padding: 8,
    marginVertical: 10,
    borderRadius: 5,
  },
});
