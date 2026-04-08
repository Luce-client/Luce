package luce.ui;

import luce.Luce;
import luce.module.Module;

public class HUDManager {
    
    public HUDManager() {
        System.out.println("[Luce Engine] HUDManager Initialized");
    }

    public void render() {
        // Render simple 1000+ FPS Watermark and Modules
        RenderUtils.drawString(Luce.NAME + " " + Luce.VERSION, 4, 4, -1);
        
        int y = 14;
        for (Module m : Luce.INSTANCE.getModuleManager().getModules()) {
            if (m.toggled) {
                RenderUtils.drawString(m.name, 4, y, -1);
                y += 10;
            }
        }
    }
}
