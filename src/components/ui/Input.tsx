import { TextInput, TextInputProps } from "react-native";
import { useTheme } from "@/core/theme/ThemeProvider";

export const Input = ({ className, ...props }: TextInputProps & { className?: string }) => {
  const { isDark } = useTheme();
  
  return (
    <TextInput
      className={`p-4 rounded-lg text-lg border ${
        isDark 
          ? "bg-slate-800 border-slate-700 text-white" 
          : "bg-gray-100 border-gray-200 text-slate-900"
      } ${className}`}
      placeholderTextColor={isDark ? "#6b7280" : "#9CA3AF"}
      {...props}
    />
  );
};
