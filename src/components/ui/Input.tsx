import { TextInput, TextInputProps } from "react-native";
import { styled } from "nativewind";

export const Input = ({ className, ...props }: TextInputProps & { className?: string }) => {
  return (
    <TextInput
      className={`bg-gray-100 p-4 rounded-lg text-lg border border-gray-200 ${className}`}
      placeholderTextColor="#9CA3AF"
      {...props}
    />
  );
};
