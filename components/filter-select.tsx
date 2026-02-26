import { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";

interface Option<T extends string | number> {
  label: string;
  value: T;
}

interface FilterSelectProps<T extends string | number> {
  label: string;
  value: T | null;
  options: Option<T>[];
  onChange: (v: T | null) => void;
  /** If true, the value cannot be cleared (e.g. sort order always has a value) */
  required?: boolean;
}

export function FilterSelect<T extends string | number>({
  label,
  value,
  options,
  onChange,
  required = false,
}: FilterSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const selectedLabel = value !== null ? options.find((o) => o.value === value)?.label : null;

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, value !== null && styles.triggerActive]}
        onPress={() => setOpen(true)}
        activeOpacity={0.75}
      >
        <ThemedText
          style={[styles.triggerText, value !== null && styles.triggerTextActive]}
          numberOfLines={1}
        >
          {selectedLabel ?? label}
        </ThemedText>
        <ThemedText style={[styles.arrow, value !== null && styles.arrowActive]}>▼</ThemedText>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                <View style={styles.sheetHeader}>
                  <ThemedText style={styles.sheetTitle}>{label}</ThemedText>
                  <TouchableOpacity onPress={() => setOpen(false)} hitSlop={12}>
                    <ThemedText style={styles.closeBtn}>✕</ThemedText>
                  </TouchableOpacity>
                </View>

                {!required && value !== null && (
                  <TouchableOpacity
                    style={styles.clearRow}
                    onPress={() => {
                      onChange(null);
                      setOpen(false);
                    }}
                  >
                    <ThemedText style={styles.clearText}>Сбросить ✕</ThemedText>
                  </TouchableOpacity>
                )}

                <FlatList
                  data={options}
                  keyExtractor={(item) => String(item.value)}
                  renderItem={({ item }) => {
                    const active = value === item.value;
                    return (
                      <TouchableOpacity
                        style={[styles.option, active && styles.optionActive]}
                        onPress={() => {
                          onChange(item.value);
                          setOpen(false);
                        }}
                      >
                        <ThemedText
                          style={[styles.optionText, active && styles.optionTextActive]}
                        >
                          {item.label}
                        </ThemedText>
                        {active && <ThemedText style={styles.check}>✓</ThemedText>}
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    gap: 6,
    flex: 1,
  },
  triggerActive: {
    backgroundColor: "#1a4a2a",
    borderColor: "#2ecc71",
  },
  triggerText: { fontSize: 13, color: "#bbb", flex: 1 },
  triggerTextActive: { color: "#2ecc71", fontWeight: "600" },
  arrow: { fontSize: 9, color: "#555" },
  arrowActive: { color: "#2ecc71" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#1c1c1c",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
    paddingBottom: 32,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  sheetTitle: { fontSize: 16, fontWeight: "600" },
  closeBtn: { fontSize: 16, color: "#777", paddingLeft: 16 },

  clearRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  clearText: { fontSize: 14, color: "#e05555" },

  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  optionActive: { backgroundColor: "#1a2e1a" },
  optionText: { fontSize: 15, color: "#ccc" },
  optionTextActive: { color: "#2ecc71", fontWeight: "600" },
  check: { color: "#2ecc71", fontSize: 16 },
});
