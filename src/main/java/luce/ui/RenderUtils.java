package luce.ui;

public class RenderUtils {
    // Legacy 1.8.9 requires OpenGL (LWJGL) wrappers.
    // In a real Optifine/MCP environment, this uses Gui.drawRect, GL11, etc.
    
    public static void drawRect(int left, int top, int right, int bottom, int color) {
        // Stub for bytecode. When injected, this will either use reflection to call Minecraft's Gui.drawRect
        // or directly use GL11 methods if we pack LWJGL.
        System.out.println("Drawing Rect: " + left + "," + top + " -> " + right + "," + bottom + " color: " + color);
    }
    
    public static void drawString(String text, int x, int y, int color) {
        // Stub for rendering string
        System.out.println("Drawing String: " + text + " at " + x + "," + y);
    }
}
