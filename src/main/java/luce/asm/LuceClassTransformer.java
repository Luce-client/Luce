package luce.asm;

import net.minecraft.launchwrapper.IClassTransformer;
import org.objectweb.asm.ClassReader;
import org.objectweb.asm.ClassWriter;
import org.objectweb.asm.Opcodes;
import org.objectweb.asm.tree.*;

public class LuceClassTransformer implements IClassTransformer {

    @Override
    public byte[] transform(String name, String transformedName, byte[] basicClass) {
        if (basicClass == null) return null;

        // 마인크래프트 핵심(메인) 클래스에 주입
        if (transformedName.equals("net.minecraft.client.Minecraft")) {
            return patchMinecraft(basicClass);
        }

        // GUI 그리기 화면 주입 (HUD 렌더용)
        if (transformedName.equals("net.minecraft.client.gui.GuiIngame")) {
            return patchGuiIngame(basicClass);
        }

        return basicClass;
    }

    private byte[] patchMinecraft(byte[] basicClass) {
        ClassNode classNode = new ClassNode();
        ClassReader classReader = new ClassReader(basicClass);
        classReader.accept(classNode, 0);

        for (MethodNode method : classNode.methods) {
            // startGame 메소드 후킹
            if (method.name.equals("startGame") || method.name.equals("aD")) { // aD is obfuscated 1.8.9 startGame
                System.out.println("[Luce Engine] Patching Minecraft.startGame()...");
                
                InsnList insnList = new InsnList();
                insnList.add(new MethodInsnNode(Opcodes.INVOKESTATIC, "luce/Luce", "init", "()V", false));
                
                // 메소드의 가장 시작 부분에 (또는 특정 지점에) 주입
                method.instructions.insert(insnList);
            }
        }

        ClassWriter classWriter = new ClassWriter(ClassWriter.COMPUTE_MAXS | ClassWriter.COMPUTE_FRAMES);
        classNode.accept(classWriter);
        return classWriter.toByteArray();
    }

    private byte[] patchGuiIngame(byte[] basicClass) {
        ClassNode classNode = new ClassNode();
        ClassReader classReader = new ClassReader(basicClass);
        classReader.accept(classNode, 0);

        for (MethodNode method : classNode.methods) {
            // renderGameOverlay 메소드 훅
            if (method.name.equals("renderGameOverlay") || method.name.equals("a")) {
                System.out.println("[Luce Engine] Patching GuiIngame.renderGameOverlay()...");
                
                InsnList insnList = new InsnList();
                insnList.add(new MethodInsnNode(Opcodes.INVOKESTATIC, "luce/Luce", "onRenderHUD", "()V", false));
                
                // 렌더링 마지막 부분에 주입 (TAIL)
                AbstractInsnNode lastReturn = method.instructions.getLast();
                while (lastReturn != null && lastReturn.getOpcode() != Opcodes.RETURN) {
                    lastReturn = lastReturn.getPrevious();
                }

                if (lastReturn != null) {
                    method.instructions.insertBefore(lastReturn, insnList);
                }
            }
        }

        ClassWriter classWriter = new ClassWriter(ClassWriter.COMPUTE_MAXS | ClassWriter.COMPUTE_FRAMES);
        classNode.accept(classWriter);
        return classWriter.toByteArray();
    }
}
