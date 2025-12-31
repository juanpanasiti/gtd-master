import { TouchableOpacity, Text, TouchableOpacityProps } from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  className?: string;
  textClassName?: string;
}

export const Button = ({ title, className, textClassName, ...props }: ButtonProps) => {
  return (
    <TouchableOpacity
      className={`bg-blue-600 p-4 rounded-lg items-center active:bg-blue-700 ${className}`}
      {...props}
    >
      <Text className={`text-white font-bold text-lg ${textClassName}`}>{title}</Text>
    </TouchableOpacity>
  );
};
