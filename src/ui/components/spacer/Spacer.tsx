import { View } from "react-native";

type SpacerProps = {
    horizontal?: number,
    vertical?: number
}

export function Spacer({ horizontal= 0, vertical = 0 }: SpacerProps) {
    return (
        <View style={{paddingHorizontal: horizontal, paddingVertical: vertical }}></View>
    )
}